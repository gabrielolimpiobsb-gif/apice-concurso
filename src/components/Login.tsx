import React, { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { Target, Mail, Lock, User as UserIcon, ArrowLeft, Leaf, PlayCircle, Phone, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";

type AuthView = "welcome" | "login" | "register" | "forgot_password";

export function Login({ onBack }: { onBack?: () => void }) {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    loginAnonymously,
    loading,
  } = useAuth();
  const [view, setView] = useState<AuthView>("welcome");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white min-h-[100dvh]">
        <div className="w-8 h-8 border-4 border-[#222] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) {
      val = val.substring(0, 11);
    }
    if (val.length > 2) {
      if (val.length > 7) {
        val = `(${val.substring(0, 2)}) ${val.substring(2, 3)} ${val.substring(3, 7)}-${val.substring(7, 11)}`;
      } else if (val.length > 3) {
        val = `(${val.substring(0, 2)}) ${val.substring(2, 3)} ${val.substring(3, 7)}`;
      } else {
        val = `(${val.substring(0, 2)}) ${val.substring(2, 3)}`;
      }
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setPhone(val);
    setPhone(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");
    setIsSubmitting(true);

    try {
      if (view === "login") {
        await loginWithEmail(email, password);
      } else if (view === "register") {
        if (!termsAccepted) {
          setError("Você precisa aceitar os Termos de Uso e Políticas de Privacidade.");
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("As senhas não coincidem.");
          setIsSubmitting(false);
          return;
        }
        if (phone.replace(/\D/g, "").length < 11) {
          setError("Por favor, insira um número de celular válido com DDD.");
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(name, email, password, phone);
      } else if (view === "forgot_password") {
        await resetPassword(email);
        setMsg("Link de recuperação enviado para o seu e-mail.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential") {
        setError("E-mail ou senha inválidos.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso.");
      } else {
        setError("Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full min-h-[100dvh] relative bg-white font-sans overflow-hidden flex">
      
      {/* Left Side (Dark) - Image Placeholder with Slanted cut */}
      <div 
        className="hidden lg:flex absolute top-0 left-0 w-[55%] h-full bg-[#111] z-10 flex-col justify-between p-12"
        style={{ clipPath: 'polygon(0 0, 100% 0, 75% 100%, 0 100%)' }}
      >
        <div className="relative z-10 flex justify-between items-center text-black dark:text-white w-[70%]">
           <span className="font-bold text-xl tracking-tight">Plataforma</span>
        </div>
        
        {/* Placeholder for future PNG background */}
        <div className="absolute inset-0 bg-black/40 z-0"></div>
      </div>

      {/* Right Side (White Form) */}
      <div className="w-full lg:w-1/2 ml-auto min-h-[100dvh] relative z-0 flex flex-col justify-center items-center py-12 px-6 sm:px-12">
        {/* Header (Back button, etc) */}
        <div className="absolute top-6 left-6 lg:left-[55%] lg:-ml-12 z-50">
          {(view !== "welcome" || onBack) && (
            <button 
              onClick={() => view !== "welcome" ? setView("welcome") : onBack?.()}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
          )}
        </div>

        <div className="w-full max-w-[360px] flex flex-col items-center">
          {/* Avatar/Logo */}
          <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center mb-6">
            <UserIcon size={32} className="text-gray-400" />
          </div>

          <h1 className="text-3xl font-bold text-black tracking-tight mb-2 text-center">
            {view === "welcome" ? "Bem-vindo(a)!" : view === "login" ? "Entrar" : view === "register" ? "Cadastrar" : "Recuperar"}
          </h1>
          <p className="text-gray-500 text-sm mb-8 text-center">
            {view === "welcome" ? "Acesse para desbloquear a plataforma" : view === "login" ? "Acesse sua conta para continuar" : view === "register" ? "Crie uma conta, é grátis e rápido" : "Redefina sua senha com segurança"}
          </p>

          {error && (
            <div className="w-full bg-red-50 text-red-600 text-xs p-4 rounded-xl mb-6 text-center border border-red-100">
              {error}
            </div>
          )}
          {msg && (
            <div className="w-full bg-emerald-50 text-emerald-600 text-xs p-4 rounded-xl mb-6 text-center border border-emerald-100">
              {msg}
            </div>
          )}

          {view === "welcome" ? (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => setView("login")}
                className="w-full bg-white border border-gray-300 text-black rounded-full py-3.5 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                Entrar
              </button>
              <button
                onClick={() => setView("register")}
                className="w-full bg-[#222] text-black dark:text-white rounded-full py-3.5 font-semibold text-sm hover:bg-black transition-all"
              >
                Cadastrar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {view === "register" && (
                <>
                  <input
                    type="text"
                    placeholder="Nome"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-black text-base rounded-full py-3.5 px-5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                  />
                  <input
                    type="tel"
                    placeholder="Celular com DDD"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-white border border-gray-300 text-black text-base rounded-full py-3.5 px-5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                  />
                </>
              )}

              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 text-black text-base rounded-full py-3.5 px-5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
              />

              {view !== "forgot_password" && (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-black text-base rounded-full py-3.5 pl-5 pr-12 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {view === "register" && (
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmar Senha"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-gray-300 text-black text-base rounded-full py-3.5 pl-5 pr-12 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  )}

                  {view === "login" && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setView("forgot_password")}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {view === "register" && (
                <div className="flex items-start gap-2 pt-1 pb-1 px-1">
                  <div className="flex h-5 items-center shrink-0">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                    />
                  </div>
                  <label htmlFor="terms" className="text-xs text-gray-500 leading-tight cursor-pointer">
                    Li e concordo com os{" "}
                    <a href="/termos" className="font-semibold text-black hover:underline" target="_blank" onClick={(e) => e.stopPropagation()}>Termos de Uso</a>{" "}
                    e{" "}
                    <a href="/privacidade" className="font-semibold text-black hover:underline" target="_blank" onClick={(e) => e.stopPropagation()}>Políticas de Privacidade</a>.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#222] hover:bg-black text-black dark:text-white rounded-full py-3.5 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
              >
                {isSubmitting
                  ? "Processando..."
                  : view === "login"
                    ? "Login"
                    : view === "register"
                      ? "Cadastrar"
                      : "Enviar Link"}
              </button>
            </form>
          )}

          {view !== "welcome" && (
            <div className="w-full mt-6">
              {view === "login" ? (
                <p className="text-[11px] text-gray-500 text-center">
                  Ainda não tem conta?{" "}
                  <button onClick={() => setView("register")} className="font-semibold text-red-500 hover:text-red-600 transition-colors">
                    Cadastrar
                  </button>
                </p>
              ) : view === "register" ? (
                <p className="text-[11px] text-gray-500 text-center">
                  Já possui conta?{" "}
                  <button onClick={() => setView("login")} className="font-semibold text-red-500 hover:text-red-600 transition-colors">
                    Entrar
                  </button>
                </p>
              ) : null}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
