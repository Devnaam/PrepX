class ApiResponse {
  success: boolean;
  statusCode: number;
  data: any;
  message: string;

  constructor(statusCode: number, data: any, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}

export default ApiResponse;
