import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Target, ArrowRight, UserPlus } from "lucide-react";
import { Button, Input } from "../components/ui";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('reservaja_token', data.token);
          onLogin();
        } else {
          const err = await response.json();
          alert(err.error || 'Falha no login');
        }
      } catch (error) {
        alert('Erro ao conectar com o servidor');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 dark:bg-gray-950 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-green-400/20 blur-3xl filter dark:bg-green-600/20"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-emerald-400/20 blur-3xl filter dark:bg-emerald-600/20"
      />
      <motion.div
        animate={{
          y: [0, -50, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/3 top-1/3 h-64 w-64 rounded-full bg-teal-300/20 blur-3xl filter dark:bg-teal-700/20"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-md space-y-8 rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:bg-gray-900/80"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl shadow-lg overflow-hidden"
          >
            <img
              src="/src/assets/images/reserva_ja_logo_1782703217853.jpg"
              alt="Reserva Já Logo"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <motion.h2
            key={isLogin ? "login-title" : "register-title"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
          </motion.h2>
          <motion.p
            key={isLogin ? "login-desc" : "register-desc"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm text-gray-500 dark:text-gray-400"
          >
            {isLogin
              ? "Faça login para continuar"
              : "Comece a alcançar suas metas hoje"}
          </motion.p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, x: -20 }}
                  animate={{ opacity: 1, height: "auto", x: 0 }}
                  exit={{ opacity: 0, height: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    label="Nome"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout>
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>

            <motion.div layout className="relative">
              <Input
                label="Senha"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </motion.div>
          </div>

          <motion.div layout className="space-y-4 pt-2">
            <Button
              type="submit"
              fullWidth
              className="group relative h-12 overflow-hidden text-lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLogin ? "Entrar" : "Criar Conta"}
                {isLogin ? (
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                ) : (
                  <UserPlus className="h-5 w-5 transition-transform group-hover:scale-110" />
                )}
              </span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] transition-transform duration-500 group-hover:translate-x-[100%]" />
            </Button>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isLogin
                ? "Não tem uma conta? Cadastre-se"
                : "Já tem uma conta? Faça login"}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
