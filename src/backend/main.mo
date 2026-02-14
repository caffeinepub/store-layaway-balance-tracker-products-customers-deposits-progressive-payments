import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Migration module and actor state


actor {
  public type Payment = {
    amount : Nat;
    date : Time.Time;
  };

  public type PendingBalance = {
    id : Text;
    category : Text;
    productType : Text;
    model : Text;
    customerFirstName : Text;
    customerLastName : Text;
    mobileNumber : Text;
    email : Text;
    salePrice : Nat;
    deposit : Nat;
    payments : [Payment];
    isPaid : Bool;
  };

  public type RepairRecord = {
    id : Text;
    deviceCategory : Text;
    deviceModel : Text;
    customerFirstName : Text;
    customerLastName : Text;
    mobileNumber : Text;
    email : Text;
    problemDescription : Text;
    quoteAmount : ?Nat;
    contactStatus : ContactStatus;
    isDelivered : Bool;
    receivedTimestamp : Time.Time;
  };

  public type ContactStatus = {
    #toCall;
    #called;
  };

  public type UserProfile = {
    name : Text;
  };

  let pendingBalances = Map.empty<Text, PendingBalance>();
  let inProgressPayments = Set.empty<Text>();
  let repairRecords = Map.empty<Text, RepairRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  module PendingBalance {
    public func compare(b1 : PendingBalance, b2 : PendingBalance) : Order.Order {
      Text.compare(b1.id, b2.id);
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getAllPendingBalances() : async [PendingBalance] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view pending balances");
    };

    let allBalances = pendingBalances.values().toArray().sort();
    allBalances.filter(
      func(balance) {
        inProgressPayments.contains(balance.id) or not balance.isPaid;
      }
    );
  };

  public shared ({ caller }) func createPendingBalance(
    id : Text,
    category : Text,
    productType : Text,
    model : Text,
    customerFirstName : Text,
    customerLastName : Text,
    mobileNumber : Text,
    email : Text,
    salePrice : Nat,
    deposit : Nat,
  ) : async PendingBalance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create new pending balances");
    };

    let newBalance : PendingBalance = {
      id;
      category;
      productType;
      model;
      customerFirstName;
      customerLastName;
      mobileNumber;
      email;
      salePrice;
      deposit;
      payments = [
        {
          amount = deposit;
          date = Time.now();
        }
      ];
      isPaid = false;
    };

    inProgressPayments.add(id);
    pendingBalances.add(id, newBalance);
    switch (pendingBalances.get(id)) {
      case (null) { Runtime.trap("Failed to retrieve new record") };
      case (?record) { record };
    };
  };

  public shared ({ caller }) func addPayment(id : Text, amount : Nat) : async PendingBalance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add payments");
    };

    switch (pendingBalances.get(id)) {
      case (null) { Runtime.trap("Record does not exist") };
      case (?record) {
        let updatedPayments = record.payments.concat([
          {
            amount;
            date = Time.now();
          }
        ]);
        let totalPaid = updatedPayments.foldLeft(0, func(acc, payment) { acc + payment.amount });
        let updatedRecord : PendingBalance = {
          record with
          payments = updatedPayments;
          isPaid = (totalPaid >= record.salePrice);
        };
        pendingBalances.add(id, updatedRecord);
        if (updatedRecord.isPaid) {
          inProgressPayments.remove(id);
        };
        updatedRecord;
      };
    };
  };

  // Profile System
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Repairs/Assistance System
  public query ({ caller }) func getAllRepairRecords() : async [RepairRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view repairs");
    };
    repairRecords.values().toArray();
  };

  public query ({ caller }) func getOpenRepairRecords() : async [RepairRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view repairs");
    };
    let all = repairRecords.values().toArray();
    all.filter(
      func(record) { not record.isDelivered }
    );
  };

  public query ({ caller }) func getRepairRecord(id : Text) : async RepairRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view repairs");
    };
    switch (repairRecords.get(id)) {
      case (null) { Runtime.trap("Record does not exist") };
      case (?record) { record };
    };
  };

  public shared ({ caller }) func createRepairRecord(
    id : Text,
    deviceCategory : Text,
    deviceModel : Text,
    customerFirstName : Text,
    customerLastName : Text,
    mobileNumber : Text,
    email : Text,
    problemDescription : Text,
    quoteAmount : ?Nat,
  ) : async RepairRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create repairs");
    };

    let newRecord : RepairRecord = {
      id;
      deviceCategory;
      deviceModel;
      customerFirstName;
      customerLastName;
      mobileNumber;
      email;
      problemDescription;
      quoteAmount;
      contactStatus = #toCall;
      isDelivered = false;
      receivedTimestamp = Time.now();
    };

    repairRecords.add(id, newRecord);
    switch (repairRecords.get(id)) {
      case (null) { Runtime.trap("Failed to retrieve new record") };
      case (?record) { record };
    };
  };

  public shared ({ caller }) func updateRepairQuote(id : Text, newQuote : Nat) : async RepairRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update repairs");
    };

    switch (repairRecords.get(id)) {
      case (null) { Runtime.trap("Record does not exist") };
      case (?record) {
        let updatedRecord = {
          record with
          quoteAmount = ?newQuote;
        };
        repairRecords.add(id, updatedRecord);
        updatedRecord;
      };
    };
  };

  public shared ({ caller }) func updateContactStatus(id : Text, status : ContactStatus) : async RepairRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update repairs");
    };

    switch (repairRecords.get(id)) {
      case (null) { Runtime.trap("Record does not exist") };
      case (?record) {
        let updatedRecord = {
          record with
          contactStatus = status;
        };
        repairRecords.add(id, updatedRecord);
        updatedRecord;
      };
    };
  };

  public shared ({ caller }) func markRepairDelivered(id : Text) : async RepairRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update repairs");
    };

    switch (repairRecords.get(id)) {
      case (null) { Runtime.trap("Record does not exist") };
      case (?record) {
        let updatedRecord = {
          record with
          isDelivered = true;
        };
        repairRecords.add(id, updatedRecord);
        updatedRecord;
      };
    };
  };

  public shared ({ caller }) func unmarkRepairDelivered(id : Text) : async RepairRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update repairs");
    };

    switch (repairRecords.get(id)) {
      case (null) { Runtime.trap("Record does not exist") };
      case (?record) {
        let updatedRecord = {
          record with
          isDelivered = false;
        };
        repairRecords.add(id, updatedRecord);
        updatedRecord;
      };
    };
  };
};
