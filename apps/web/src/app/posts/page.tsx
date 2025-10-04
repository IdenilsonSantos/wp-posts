"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { apiFetch } from "@/app/utils/apiFetcher";
import Navbar from "@/components/navbar";
import { ErrorBoundaryCustom } from "@/components/errorBondary";

interface Post {
  id: number;
  title: string;
  excerpt: string;
  slug?: string;
}

interface ApiResponse {
  data: Post[];
  totalPages: number;
}

interface FormValues {
  search: string;
}

export default function Posts() {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { search: "" },
  });

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["posts", search, page],
    queryFn: async () =>
      apiFetch<unknown, ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}content/posts?search=${search}&page=${page}&per_page=5`,
        {
          method: "GET",
        }
      ),
  });

  const totalPages = data?.totalPages || 1;
  const posts = data?.data || [];

  const onSubmit: SubmitHandler<FormValues> = ({ search }) => {
    setPage(1);
    setSearch(search);
  };

  return (
    <ErrorBoundaryCustom fallback={<p>Ops, algo deu errado 😢</p>}>
      <Navbar logoText="Meus Posts" showLinks={false} />
      <div className="container mx-auto p-4">
        <div className="w-full p-8 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6 py-2">
            <h1 className="text-2xl font-bold">Lista de Posts</h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mb-4 flex gap-2 align-baseline"
          >
            <Input
              register={register("search")}
              name="search"
              id="search"
              placeholder="Buscar posts..."
            />
            <button
              type="submit"
              className="bg-emerald-500 
              py-2 px-4 h-full mt-2 rounded-md text-white 
              transition-colors focus:outline-none 
              hover:bg-emerald-600 cursor-pointer"
            >
              Buscar
            </button>
          </form>

          <div className="overflow-x-auto max-h-[500px] rounded-lg shadow-md border border-gray-700">
            <table className="table-fixed min-w-full border-collapse">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="p-3 text-left">Título</th>
                  <th className="p-3 text-left">Slug</th>
                  <th className="p-3 text-left w-[300px]">Resumo</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center p-6 border-t border-gray-600"
                    >
                      Carregando posts...
                    </td>
                  </tr>
                ) : isError || posts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center p-4 border-t border-gray-600 text-gray-400"
                    >
                      Nenhum post encontrado
                    </td>
                  </tr>
                ) : (
                  posts?.map((post) => (
                    <tr
                      key={post.id}
                      className="odd:bg-gray-800 even:bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                      <td
                        className="p-3 border-t border-gray-600 font-semibold"
                        dangerouslySetInnerHTML={{ __html: post.title }}
                      />
                      <td className="p-3 border-t border-gray-600 font-semibold">
                        {post.slug ?? "-"}
                      </td>
                      <td
                        className="p-3 border-t border-gray-600 text-sm text-gray-300"
                        dangerouslySetInnerHTML={{ __html: post.excerpt }}
                      />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {posts.length > 0 && (
            <div className="flex items-center gap-2 mt-6 justify-center">
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-white">
                Página {page} de {totalPages}
              </span>
              <Button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                variant="success"
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundaryCustom>
  );
}
