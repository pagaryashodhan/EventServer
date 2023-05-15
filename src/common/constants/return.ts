export function successfullReturn(data: any, message?: string) {
  return {
    status: true,
    data: data,
    message: message ?? 'success',
  };
}
export function failureReturn(message: string) {
  return {
    status: false,
    data: null,
    message: message,
  };
}
