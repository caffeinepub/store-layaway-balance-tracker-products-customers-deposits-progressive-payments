/**
 * Validation utilities for repair form fields
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) {
    return `${fieldName} è obbligatorio`;
  }
  return null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'Email è obbligatoria';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Formato email non valido';
  }
  
  return null;
}

/**
 * Validate all repair form fields
 */
export function validateRepairForm(formData: {
  deviceCategory: string;
  deviceModel: string;
  customerFirstName: string;
  customerLastName: string;
  mobileNumber: string;
  email: string;
  problemDescription: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const deviceCategoryError = validateRequired(formData.deviceCategory, 'Categoria dispositivo');
  if (deviceCategoryError) errors.deviceCategory = deviceCategoryError;

  const deviceModelError = validateRequired(formData.deviceModel, 'Modello dispositivo');
  if (deviceModelError) errors.deviceModel = deviceModelError;

  const firstNameError = validateRequired(formData.customerFirstName, 'Nome');
  if (firstNameError) errors.customerFirstName = firstNameError;

  const lastNameError = validateRequired(formData.customerLastName, 'Cognome');
  if (lastNameError) errors.customerLastName = lastNameError;

  const mobileError = validateRequired(formData.mobileNumber, 'Numero cellulare');
  if (mobileError) errors.mobileNumber = mobileError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const problemError = validateRequired(formData.problemDescription, 'Descrizione problema');
  if (problemError) errors.problemDescription = problemError;

  return errors;
}
