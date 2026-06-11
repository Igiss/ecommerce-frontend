'use client'

import { useEffect, useState } from 'react'
import { getAdminUsers, updateUserStatus } from '@/lib/api/admin.service'
import { UserCheck, UserX, Search, ShieldAlert, Loader2, AlertCircle, RefreshCw } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'blocked'>('pending')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = () => {
    setLoading(true)
    setError('')
    getAdminUsers()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setUsers(data)
        } else if (data && typeof data === 'object' && 'users' in data && Array.isArray(data.users)) {
          setUsers(data.users)
        } else {
          setUsers([])
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Không thể tải danh sách tài khoản.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Apply filters client-side
  useEffect(() => {
    let result = [...users]

    // Filter by role/status tabs
    if (activeTab === 'pending') {
      result = result.filter((u) => u.role === 'owner' && u.status === 'pending')
    } else if (activeTab === 'active') {
      result = result.filter((u) => u.role === 'owner' && u.status === 'active')
    } else if (activeTab === 'blocked') {
      result = result.filter((u) => u.role === 'owner' && u.status === 'blocked')
    } // 'all' displays everything

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query)
      )
    }

    setFilteredUsers(result)
  }, [users, activeTab, searchQuery])

  const handleUpdateStatus = async (userId: string, newStatus: 'pending' | 'active' | 'blocked') => {
    setActionLoading(userId)
    try {
      await updateUserStatus(userId, newStatus)
      // Update local state directly
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === userId || u._id === userId ? { ...u, status: newStatus } : u))
      )
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái người dùng.')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700 border border-green-100">Đang hoạt động</span>
      case 'pending':
        return <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-100 animate-pulse">Chờ phê duyệt</span>
      case 'blocked':
        return <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 border border-red-100">Bị khóa / Từ chối</span>
      default:
        return <span className="inline-flex rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700">{status}</span>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-extrabold text-purple-700 border border-purple-100 uppercase tracking-wide">Admin</span>
      case 'owner':
        return <span className="inline-flex items-center gap-1 rounded-md bg-amber-55/10 px-2 py-0.5 text-xs font-extrabold text-amber-900 border border-amber-200/50 uppercase tracking-wide">Owner (Người bán)</span>
      default:
        return <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600 border border-stone-200 uppercase tracking-wide">User (Người mua)</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Duyệt và Quản lý Người bán</h1>
          <p className="text-xs text-stone-550 mt-1">Phê duyệt đơn đăng ký bán hàng, quản lý và khóa tài khoản các shop vi phạm.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 px-3 py-2 text-xs font-bold text-stone-700 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Tải lại danh sách
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-stone-200 pb-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            Chờ duyệt (Pending)
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            Đang hoạt động (Active)
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'blocked'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            Bị khóa / Từ chối (Blocked)
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            Tất cả tài khoản
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên, email, sđt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-9 pr-4 text-xs transition-all placeholder:text-stone-400 focus:border-amber-600 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Table Content */}
      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded-2xl border border-stone-200">
          <Loader2 className="h-8 w-8 animate-spin text-amber-800" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 border border-stone-200 border-dashed rounded-2xl bg-white">
          <p className="text-stone-500 text-sm font-medium">Không tìm thấy tài khoản nào phù hợp.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full text-left text-sm text-stone-600 border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-xs font-bold text-stone-500 uppercase tracking-wider bg-stone-50/50">
                <th className="py-3.5 px-6">Thông tin Cửa hàng / Chủ shop</th>
                <th className="py-3.5 px-6">Số điện thoại</th>
                <th className="py-3.5 px-6">Vai trò</th>
                <th className="py-3.5 px-6">Trạng thái</th>
                <th className="py-3.5 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.map((u) => {
                const userId = u.id || u._id
                const isUserActionLoading = actionLoading === userId
                
                return (
                  <tr key={userId} className="hover:bg-stone-50/30 transition-colors">
                    {/* User info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0 font-bold text-stone-700 text-sm">
                          {u.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-stone-900">{u.fullName}</p>
                          <p className="text-xs text-stone-400 mt-0.5 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-6 text-xs text-stone-850 font-medium font-mono">{u.phone || 'Chưa cung cấp'}</td>

                    {/* Role */}
                    <td className="py-4 px-6">{getRoleBadge(u.role)}</td>

                    {/* Status */}
                    <td className="py-4 px-6">{getStatusBadge(u.status)}</td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isUserActionLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-amber-800" />
                        ) : (
                          <>
                            {/* Phê duyệt / Mở khóa */}
                            {u.status !== 'active' && (
                              <button
                                onClick={() => handleUpdateStatus(userId, 'active')}
                                className="inline-flex items-center gap-1 rounded-lg bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 text-xs font-bold shadow-sm transition-colors cursor-pointer"
                                title="Phê duyệt hoạt động"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                {u.status === 'pending' ? 'Duyệt' : 'Mở khóa'}
                              </button>
                            )}

                            {/* Khóa / Từ chối */}
                            {u.status !== 'blocked' && (
                              <button
                                onClick={() => handleUpdateStatus(userId, 'blocked')}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-650 px-2.5 py-1 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                                title="Từ chối / Khóa tài khoản"
                              >
                                <UserX className="h-3.5 w-3.5" />
                                {u.status === 'pending' ? 'Từ chối' : 'Khóa'}
                              </button>
                            )}

                            {/* Info for normal users or admins */}
                            {u.role !== 'owner' && (
                              <span className="text-xs text-stone-400 italic">Không khả dụng</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
