import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PendingBalance, UserProfile, RepairRecord, ContactStatus } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Pending Balances Queries
export function useGetAllPendingBalances() {
  const { actor, isFetching } = useActor();

  return useQuery<PendingBalance[]>({
    queryKey: ['pendingBalances'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPendingBalances();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreatePendingBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      category: string;
      productType: string;
      model: string;
      customerFirstName: string;
      customerLastName: string;
      mobileNumber: string;
      email: string;
      salePrice: bigint;
      deposit: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPendingBalance(
        params.id,
        params.category,
        params.productType,
        params.model,
        params.customerFirstName,
        params.customerLastName,
        params.mobileNumber,
        params.email,
        params.salePrice,
        params.deposit
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingBalances'] });
    },
  });
}

export function useAddPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPayment(params.id, params.amount);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pendingBalances'] });
      queryClient.invalidateQueries({ queryKey: ['pendingBalance', data.id] });
    },
  });
}

// Repairs Queries
export function useGetAllRepairRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<RepairRecord[]>({
    queryKey: ['repairRecords', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRepairRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetOpenRepairRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<RepairRecord[]>({
    queryKey: ['repairRecords', 'open'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOpenRepairRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRepairRecord(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<RepairRecord>({
    queryKey: ['repairRecord', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getRepairRecord(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateRepairRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      deviceCategory: string;
      deviceModel: string;
      customerFirstName: string;
      customerLastName: string;
      mobileNumber: string;
      email: string;
      problemDescription: string;
      quoteAmount: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRepairRecord(
        params.id,
        params.deviceCategory,
        params.deviceModel,
        params.customerFirstName,
        params.customerLastName,
        params.mobileNumber,
        params.email,
        params.problemDescription,
        params.quoteAmount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairRecords'] });
    },
  });
}

export function useUpdateRepairQuote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; newQuote: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRepairQuote(params.id, params.newQuote);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repairRecords'] });
      queryClient.invalidateQueries({ queryKey: ['repairRecord', data.id] });
    },
  });
}

export function useUpdateContactStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: ContactStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateContactStatus(params.id, params.status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repairRecords'] });
      queryClient.invalidateQueries({ queryKey: ['repairRecord', data.id] });
    },
  });
}

export function useMarkRepairDelivered() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markRepairDelivered(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repairRecords'] });
      queryClient.invalidateQueries({ queryKey: ['repairRecord', data.id] });
    },
  });
}

export function useUnmarkRepairDelivered() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unmarkRepairDelivered(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repairRecords'] });
      queryClient.invalidateQueries({ queryKey: ['repairRecord', data.id] });
    },
  });
}
