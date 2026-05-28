"use client";

import { useSession } from "next-auth/react";
import { useSubscription } from "../../lib/useSubscription";
import { useState, useEffect } from "react";
import Link from "next/link";

interface AdminStats {
  total_users: number;
  premium_users: number;
  total_operations: number;
  conversion_rate: number;
  mrr: number;
}

interface UserRow {
  id: number;
  email: string;
  usage_count: number;
  is_admin: boolean;
  is_tester: boolean;
  premium_status: string;
  current_period_end: string | null;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const { isAdmin, loading: subLoading } = useSubscription();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  // Fetch Stats and Users
  useEffect(() => {
    if (!subLoading && isAdmin && session?.user?.email) {
      fetchStats();
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subLoading, isAdmin, session]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          "X-User-Email": session?.user?.email || "",
        },
      });
      if (!res.ok) throw new Error("Error al cargar estadísticas");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Error al conectar con el backend.");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async (query = "") => {
    try {
      setLoadingUsers(true);
      const url = query
        ? `${API_URL}/admin/users?q=${encodeURIComponent(query)}`
        : `${API_URL}/admin/users`;
      const res = await fetch(url, {
        headers: {
          "X-User-Email": session?.user?.email || "",
        },
      });
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      const error = err as Error;
      setErrorMsg(error.message || "Error al conectar con el backend.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchUsers(val);
  };

  const toggleRole = async (userId: number, role: "is_admin" | "is_tester") => {
    try {
      setActionLoading(userId);
      const formData = new FormData();
      formData.append("role", role);

      const res = await fetch(`${API_URL}/admin/users/${userId}/toggle-role`, {
        method: "POST",
        headers: {
          "X-User-Email": session?.user?.email || "",
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al cambiar de rol");
      }

      // Refresh stats & local users list
      fetchStats();
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              is_admin: role === "is_admin" ? !u.is_admin : u.is_admin,
              is_tester: role === "is_tester" ? !u.is_tester : u.is_tester,
            };
          }
          return u;
        })
      );
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const togglePremium = async (userId: number, currentStatus: string) => {
    try {
      setActionLoading(userId);
      const newStatus = currentStatus === "active" ? "free" : "active";
      const formData = new FormData();
      formData.append("status", newStatus);

      const res = await fetch(`${API_URL}/admin/users/${userId}/set-premium`, {
        method: "POST",
        headers: {
          "X-User-Email": session?.user?.email || "",
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al modificar plan");
      }

      // Refresh stats & local users list
      fetchStats();
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              premium_status: newStatus,
            };
          }
          return u;
        })
      );
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (subLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Validando credenciales de administrador...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl shadow-red-500/10">
          🛡️
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Acceso Denegado</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Esta zona está restringida únicamente al equipo de desarrollo y administración de DocuFlow. Si crees que se trata de un error, ponte en contacto con soporte.
        </p>
        <Link
          href="/"
          className="px-6 py-3 btn-gradient text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                Panel Oficial
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              Dashboard de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Administración</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Monitorea el crecimiento en tiempo real de DocuFlow y gestiona usuarios de forma directa.
            </p>
          </div>
          
          <button
            onClick={() => { fetchStats(); fetchUsers(search); }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm text-sm"
          >
            🔄 Actualizar Datos
          </button>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <span>⚠️</span>
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Card 1: Total Users */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usuarios</span>
              <span className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-lg">👥</span>
            </div>
            <div>
              <h3 className="text-3xl font-black">
                {loadingStats ? (
                  <span className="inline-block w-20 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></span>
                ) : (
                  stats?.total_users ?? 0
                )}
              </h3>
              <p className="text-xs text-gray-400 mt-2">Cuentas creadas a la fecha</p>
            </div>
          </div>

          {/* Card 2: Premium Active */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Suscripciones Activas</span>
              <span className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-lg">👑</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                {loadingStats ? (
                  <span className="inline-block w-20 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></span>
                ) : (
                  stats?.premium_users ?? 0
                )}
              </h3>
              <p className="text-xs text-gray-400 mt-2">Usuarios Pro en plan recurrente</p>
            </div>
          </div>

          {/* Card 3: Conversion Rate */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversión Premium</span>
              <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-lg">📈</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-emerald-500">
                {loadingStats ? (
                  <span className="inline-block w-20 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></span>
                ) : (
                  `${stats?.conversion_rate ?? 0}%`
                )}
              </h3>
              <p className="text-xs text-gray-400 mt-2">Conversión general de Free a Pro</p>
            </div>
          </div>

          {/* Card 4: Estimated MRR */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-yellow-500/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">MRR Estimado</span>
              <span className="w-10 h-10 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center text-lg">💰</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-yellow-500">
                {loadingStats ? (
                  <span className="inline-block w-20 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></span>
                ) : (
                  `$${stats?.mrr ?? 0} USD`
                )}
              </h3>
              <p className="text-xs text-gray-400 mt-2">Ingreso mensual recurrente aproximado</p>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-extrabold">Gestión Integral de Usuarios</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Busca, otorga membresías de prueba y gestiona los roles de la base de datos.</p>
            </div>
            
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar por email..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute left-3.5 top-3.5 text-gray-400 text-sm">🔍</span>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-4">Usuario (Email)</th>
                  <th className="py-4 px-4">Uso (Ops)</th>
                  <th className="py-4 px-4">Plan Actual</th>
                  <th className="py-4 px-4 text-center">Admin</th>
                  <th className="py-4 px-4 text-center">Tester QA</th>
                  <th className="py-4 px-4 text-right">Controles Rápidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {loadingUsers ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-5 px-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-48 rounded"></div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-12 rounded"></div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 w-16 rounded-full"></div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-8 mx-auto rounded"></div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-8 mx-auto rounded"></div>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <div className="h-8 bg-gray-200 dark:bg-gray-800 w-32 ml-auto rounded-lg"></div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors text-sm">
                      <td className="py-4 px-4 font-bold max-w-[200px] truncate" title={user.email}>
                        {user.email}
                      </td>
                      <td className="py-4 px-4 font-mono text-gray-500">
                        {user.usage_count} ops
                      </td>
                      <td className="py-4 px-4">
                        {user.premium_status === "active" ? (
                          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                            👑 Premium
                          </span>
                        ) : (
                          <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          disabled={actionLoading === user.id}
                          onClick={() => toggleRole(user.id, "is_admin")}
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center font-bold text-xs border transition-all ${
                            user.is_admin
                              ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                              : "border-gray-300 dark:border-gray-700 text-gray-400 hover:border-blue-500"
                          }`}
                        >
                          {user.is_admin ? "✓" : ""}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          disabled={actionLoading === user.id}
                          onClick={() => toggleRole(user.id, "is_tester")}
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center font-bold text-xs border transition-all ${
                            user.is_tester
                              ? "bg-purple-500 border-purple-500 text-white shadow-sm"
                              : "border-gray-300 dark:border-gray-700 text-gray-400 hover:border-purple-500"
                          }`}
                        >
                          {user.is_tester ? "✓" : ""}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={actionLoading === user.id}
                            onClick={() => togglePremium(user.id, user.premium_status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                              user.premium_status === "active"
                                ? "bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-100"
                                : "btn-gradient text-white hover:scale-[1.03]"
                            }`}
                          >
                            {user.premium_status === "active" ? "Remover Premium" : "Hacer Premium"}
                          </button>
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
    </div>
  );
}
