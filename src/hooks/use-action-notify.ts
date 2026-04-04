import { toast } from "sonner";

interface NotifyOptions {
  message: string;
  description?: string;
  icon?: string;
  duration?: number;
}

export const actionNotify = ({
  message,
  description,
  icon = "✨",
  duration = 2500,
}: NotifyOptions) => {
  toast(message, {
    description,
    icon,
    duration,
    position: "top-center",
    style: {
      background: "hsl(var(--card))",
      color: "hsl(var(--foreground))",
      border: "1px solid hsl(var(--border))",
      boxShadow: "0 8px 32px hsl(var(--foreground) / 0.1)",
      borderRadius: "0.75rem",
      fontFamily: "var(--font-body)",
    },
  });
};

export const useActionNotify = () => {
  return { notify: actionNotify };
};
