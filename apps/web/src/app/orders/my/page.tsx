"use client";

import { JSX, useEffect, useState } from "react";
import { apiFetch } from "@/app/utils/apiFetcher";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";

interface Order {
  id: string;
  productSku: string;
  qty: number;
  status: string;
}

interface ApiResponse {
  data: Order[];
}

export default function MyOrders() {
  const [token, setToken] = useState<string | undefined>();

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["myOrders", token],
    queryFn: async () =>
      apiFetch<unknown, ApiResponse>("http://localhost:3000/api/orders/my/", {
        method: "GET",
        token,
      }),
    enabled: !!token,
  });

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("access_token");
    if (tokenFromStorage) setToken(tokenFromStorage);
  }, []);

  const getStatus = (status: string) => {
    const statusMap: Record<string, JSX.Element> = {
      PENDING: (
        <div className="w-[100px] bg-red-500 text-sm rounded-full text-center">
          Pendente
        </div>
      ),
      PAID: (
        <div className="w-[100px] bg-green-500 text-sm rounded-full text-center">
          Pago
        </div>
      ),
    };

    return (
      statusMap[status] ?? <div className="badge badge-ghost">Desconhecido</div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="w-full p-8 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6 py-2">
            <h1 className="text-2xl font-bold">Lista de Pedidos</h1>
          </div>
          <div className="overflow-x-auto max-h-[400px] rounded-lg shadow-md border border-gray-700">
            <table className="table-fixed min-w-full border-collapse">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-3 text-center w-[80px]">Id</th>
                  <th className="p-3 text-center w-[120px]">Quantidade</th>
                  <th className="p-3 text-center w-[280px]">Sku</th>
                  <th className="p-3 text-center w-[150px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center p-6 border-t border-gray-600"
                    >
                      <span>Carregando pedidos...</span>
                    </td>
                  </tr>
                ) : isError || !data?.data.length ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center p-4 border-t border-gray-600 text-gray-400"
                    >
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                ) : (
                  data.data.map(({ id, productSku, qty, status }) => (
                    <tr
                      key={id}
                      className="odd:bg-gray-800 even:bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <td className="text-center p-3 border-t border-gray-600 truncate">
                        {id}
                      </td>
                      <td className="text-center p-3 border-t border-gray-600">
                        {qty}
                      </td>
                      <td className="text-center p-3 border-t border-gray-600 truncate">
                        {productSku}
                      </td>
                      <td className="p-3 border-t border-gray-600">
                        <div className="flex justify-center">
                          {getStatus(status)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
