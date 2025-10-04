"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import SelectInput from "@/components/select";
import Navbar from "@/components/navbar";
import { apiFetch } from "../utils/apiFetcher";

const schema = z.object({
  productSku: z
    .string()
    .min(3, "O código do produto deve ter no mínimo 3 caracteres"),
  qty: z.coerce.number().int().min(1, "A quantidade mínima é 1"),
  status: z.string().refine((val) => ["PENDING", "PAID"].includes(val), {
    message: "Selecione um status válido (Pendente ou Pago)",
  }),
});

type FormData = z.infer<typeof schema>;

export default function Orders() {
  const [token, setToken] = useState<string | undefined>();
  const createOrder = useCreateOrder(token);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
  });

  useEffect(() => {
    async function fetchToken() {
      const res = await apiFetch<undefined, { token: string | undefined }>(
        "/api/get-token"
      );
      setToken(res.token);
    }
    fetchToken();
  }, []);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await createOrder.mutateAsync(data);
    reset();
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="w-full p-8 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6 py-2">
            <h1 className="text-2xl font-bold">Novo Pedido</h1>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 flex flex-col gap-4 w-[500px]"
          >
            <Input
              id="productSku"
              label="Nome"
              placeholder="Nome"
              register={register("productSku")}
              error={errors.productSku}
            />

            <Input
              id="qty"
              label="Quantidade"
              placeholder="0"
              type="number"
              min={0}
              register={register("qty")}
              error={errors.qty}
            />

            <SelectInput
              label="Status"
              name="status"
              control={control}
              options={[
                { label: "Pendente", value: "PENDING" },
                { label: "Pago", value: "PAID" },
              ]}
            />

            <div className="flex flex-col gap-2 mt-2">
              <Button
                type="submit"
                variant="success"
                className="cursor-pointer"
                loading={createOrder.isPending}
              >
                Confirmar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
