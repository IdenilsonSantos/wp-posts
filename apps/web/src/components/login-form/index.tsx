"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../input";
import { Button } from "../button";
import { apiFetch } from "@/app/utils/apiFetcher";
import { Toast } from "../toast";
import { toast } from "react-toastify";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres"),
});

type LoginData = { email: string; password: string };
type LoginResponse = { access_token: string };

type FormData = z.infer<typeof schema>;

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await apiFetch<LoginData, LoginResponse>(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          body: data,
        }
      );

      localStorage.setItem("access_token", result.access_token);
    } catch (err) {
      console.error("Erro no login:", err);
      toast.error("Usuário ou senha inválidos");
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center">
      <div className="w-full min-w-[400px] bg-gray-800 rounded-lg shadow-md p-6 min-h-[400px] flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white text-center">
            Login
          </h2>
          <p className="mt-2 text-center text-gray-400">
            Entre com a sua conta
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col gap-4"
        >
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="seuemail@email.com"
            register={register("email")}
            error={errors.email}
          />

          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="senha"
            register={register("password")}
            error={errors.password}
          />

          <div className="flex flex-col gap-2 mt-2">
            <Button type="submit" variant="success" className="cursor-pointer">
              Entrar
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer"
            >
              Cadastrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
