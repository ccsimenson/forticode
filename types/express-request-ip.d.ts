declare module 'express-request-ip' {
  export default function requestIp(): (req: any, res: any, next: any) => void;
}
