import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight, UserPlus, Loader2 } from "lucide-react";
import { Button, Input } from "../components/ui";
import logoImg from "../assets/images/reserva_ja_logo_1782703217853.jpg";
import { supabase } from "../lib/supabase";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } }
        });
        if (error) throw error;
        if (data.user) onLogin();
      }
    } catch (err: any) {
      const msg = err?.message || 'Ocorreu um erro.';
      if (msg.includes('Invalid login credentials')) setError('E-mail ou senha inválidos.');
      else if (msg.includes('User already registered')) setError('Este e-mail já está cadastrado.');
      else if (msg.includes('Password should be')) setError('A senha deve ter pelo menos 6 caracteres.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-4 dark:bg-gray-950 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-green-400/20 blur-3xl filter dark:bg-green-600/20"
      />
      <motion.div
        animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-emerald-400/20 blur-3xl filter dark:bg-emerald-600/20"
      />
      <motion.div
        animate={{ y: [0, -50, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
            <img src={logoImg} alt="Reserva Já Logo" className="h-full w-full object-cover" />
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
            {isLogin ? "Faça login para continuar" : "Comece a alcançar suas metas hoje"}
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
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </motion.div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400"
            >
              {error}
            </motion.p>
          )}

          <motion.div layout className="space-y-4 pt-2">
            <Button
              type="submit"
              fullWidth
              className="group relative h-12 overflow-hidden text-lg"
              disabled={loading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isLogin ? (
                  <>Entrar <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>
                ) : (
                  <>Criar Conta <UserPlus className="h-5 w-5 transition-transform group-hover:scale-110" /></>
                )}
              </span>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] transition-transform duration-500 group-hover:translate-x-[100%]" />
            </Button>

            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Faça login"}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
