import { apiFetch } from "@/app/utils/apiFetcher";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type CreateOrderData = {
  productSku: string;
  qty: number;
  status: string;
};

type CreateOrderResponse = {
  message: string;
  orderId?: string;
};

export function useCreateOrder(token?: string) {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, Error, CreateOrderData>({
    mutationFn: async (data) =>
      await apiFetch<CreateOrderData, CreateOrderResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}orders`,
        {
          method: "POST",
          body: data,
          token,
        }
      ),
    onSuccess: () => {
      toast.success("Pedido criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Erro ao criar pedido");
    },
  });
}
