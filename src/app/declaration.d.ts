// Vite client types for asset imports
/// <reference types="vite/client" />

declare module "*.glsl" {
  const value: string;
  export default value;
}
