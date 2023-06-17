import { Cookie } from 'express-session'

declare module 'express-session' {
  interface SessionData {
    [key: string]: any
    cookies: Cookie
  }
}
