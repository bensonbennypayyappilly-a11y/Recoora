declare global {
  interface Window {
    Paddle: {
      Checkout: {
        open: (options: any) => void;
      };
    };
  }
}

export {};