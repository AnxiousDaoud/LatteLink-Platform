import "react";

declare module "react" {
  interface Attributes {
    className?: string;
    contentContainerClassName?: string;
  }
}
