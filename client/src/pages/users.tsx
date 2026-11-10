import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit3, Trash2, Bell, UserCheck, X, ArrowUpDown, ArrowUp, ArrowDown, Loader2, ThumbsUp } from "lucide-react";
import { Link } from "wouter";
import { fetchWithCredentials } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  email: string;
  password: string,
  role: "Admin" | "HR Leader" | "Functional Leader";
  department: string;
  status: "Active" | "InActive";
  last_login: string;
}

export default function UsersComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "Functional Leader",
    department: "",
    status: "Active"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sample notifications
  const [notifications, setNotifications] = useState([
    "10001 was reviewed and needs your approval",
    "User access updated",
    "New user request pending for 10004",
    "Security alert",
    "System maintenance scheduled"
  ]);

  // Function to render notification text with job code links
  const renderNotificationWithLinks = (text: string) => {
    const jobCodeRegex = /\b(\d{4,5})\b/g;
    const parts = text.split(jobCodeRegex);

    return parts.map((part, index) => {
      if (/^\d{4,5}$/.test(part)) {
        return (
          <span
            key={index}
            className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setShowNotifications(false);
              window.location.href = `/editing?jobCode=${part}`;
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Construct query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (sortBy) params.append("sortBy", sortBy);
      if (sortOrder) params.append("sortOrder", sortOrder);

      const response = await fetchWithCredentials(`/api/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (err) {
      // setError(err.message || "An error occurred while fetching users");
      // console.error("Fetch users error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and when filters/sort change
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-800";
      case "HR Leader":
        return "bg-blue-100 text-blue-800";
      case "Functional Leader":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "InActive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddUser = async () => {
    if (newUser.name && newUser.password && newUser.email && newUser.role && newUser.department) {
      try {
        setIsLoading(true);
        const response = await fetchWithCredentials("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newUser)
        });

        if (!response.ok) {
          throw new Error(`Failed to add user: ${response.statusText}`);
        }

        // Reset form and close modal
        setNewUser({
          name: "",
          email: "",
          role: "Functional Leader",
          department: "",
          status: "Active"
        });
        setShowAddModal(false);

        // Refresh user list
        fetchUsers();
      } catch (err) {
        // setError(err.message || "Failed to add user");
        // console.error("Add user error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditUser = (user: User) => {
    user.password = ""
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (editingUser) {
      try {
        setIsLoading(true);
        const response = await fetchWithCredentials(`/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(editingUser)
        });

        if (!response.ok) {
          throw new Error(`Failed to update user: ${response.statusText}`);
        }

        setShowEditModal(false);
        setEditingUser(null);

        // Refresh user list
        fetchUsers();
      } catch (err) {
        // setError(err.message || "Failed to update user");
        // console.error("Update user error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        setIsLoading(true);
        const response = await fetchWithCredentials(`/api/users/${userToDelete.id}`, {
          method: "DELETE"
        });

        if (!response.ok) {
          throw new Error(`Failed to delete user: ${response.statusText}`);
        }

        setShowDeleteDialog(false);
        setUserToDelete(null);

        // Refresh user list
        fetchUsers();
      } catch (err) {
        // setError(err.message || "Failed to delete user");
        // console.error("Delete user error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSortBy("");
    setSortOrder("asc");
  };

  
  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  };

  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith('@') && !value.includes('acme-health.com')) {
      setNewUser({ ...newUser, email: value + 'acme-health.com' });
    } else {
      setNewUser({ ...newUser, email: value });
    }
  };

  const hasActiveFilters = searchTerm !== "" || roleFilter !== "all" || statusFilter !== "all";

  return (
    <div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <Button onClick={() => setShowAddModal(true)} className="text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />           
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="HR Leader">HR Leader</SelectItem>
              <SelectItem value="Functional Leader">Functional Leader</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="InActive">InActive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      {getSortIcon('email')}
                    </div>
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('role')}>
                    <div className="flex items-center space-x-1">
                      <span>Role</span>
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('department')}>
                    <div className="flex items-center space-x-1">
                      <span>Department</span>
                      {getSortIcon('department')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('last_login')}>
                    <div className="flex items-center space-x-1">
                      <span>Last Login</span>
                      {getSortIcon('last_login')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'HR Leader' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.last_login}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        {/* <Button   disabled={user.status == 'InActive'} variant="ghost" size="sm" onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


      </div>







      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newName">Name</Label>
              <Input
                id="newName"
                value={newUser.name || ""}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter full name"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="newEmail">Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newUser.email || ""}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                autoComplete="off"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="newPassword">Password</Label>
                {validatePassword(newUser.password || "") && (
                  <ThumbsUp className="h-4 w-4 text-green-600 mr-3" />
                )}
              </div>
              <Input
                id="newPassword"
                type="text"
                value={newUser.password || ""}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Enter password"
                autoComplete="off"
              />
              <div className="mt-2">
                <p className="text-sm text-gray-700 mb-2">Password Requirements:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center">
                    <span className={`mr-2 ${(newUser.password || "").length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={(newUser.password || "").length >= 8 ? 'text-green-600' : 'text-gray-500'}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${/[A-Z]/.test(newUser.password || "") ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={/[A-Z]/.test(newUser.password || "") ? 'text-green-600' : 'text-gray-500'}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${/[a-z]/.test(newUser.password || "") ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={/[a-z]/.test(newUser.password || "") ? 'text-green-600' : 'text-gray-500'}>One lowercase letter</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${/\d/.test(newUser.password || "") ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={/\d/.test(newUser.password || "") ? 'text-green-600' : 'text-gray-500'}>One number</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(newUser.password || "") ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(newUser.password || "") ? 'text-green-600' : 'text-gray-500'}>One special character</span>
                  </div>
                </div>
              </div>

            </div>
            <div>
              <Label htmlFor="newRole">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as User['role'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="HR Leader">HR Leader</SelectItem>
                  <SelectItem value="Functional Leader">Functional Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newDepartment">Department</Label>
              <Select value={newUser.department} onValueChange={(value) => setNewUser({ ...newUser, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Research & Development">Research & Development</SelectItem>
                  <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Facilities">Facilities</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newStatus">Status</Label>
              <Select value={newUser.status} onValueChange={(value) => setNewUser({ ...newUser, status: value as User['status'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="InActive">InActive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button
                onClick={handleAddUser}
                disabled={!newUser.name || !newUser.email || !newUser.role || !newUser.password || !newUser.department || !validatePassword(newUser.password || "")}
              >
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Edit User Modal */}
     <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                  autoComplete="off"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="editPassword">Password</Label>
                  {validatePassword(editingUser.password) && (
                    <ThumbsUp className="h-4 w-4 text-green-600 mr-3" />
                  )}
                </div>
                <Input
                  id="editPassword"
                  type="text"
                  value={editingUser.password || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  placeholder="Enter password"
                  autoComplete="off"
                />
                <div className="mt-2">
                  <p className="text-sm text-gray-700 mb-2">Password Requirements:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center">
                      <span className={`mr-2 ${editingUser.password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={editingUser.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${/[A-Z]/.test(editingUser.password) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={/[A-Z]/.test(editingUser.password) ? 'text-green-600' : 'text-gray-500'}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${/[a-z]/.test(editingUser.password) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={/[a-z]/.test(editingUser.password) ? 'text-green-600' : 'text-gray-500'}>One lowercase letter</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${/\d/.test(editingUser.password) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={/\d/.test(editingUser.password) ? 'text-green-600' : 'text-gray-500'}>One number</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`mr-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(editingUser.password) ? 'text-green-500' : 'text-gray-400'}`}>✓</span>
                      <span className={/[!@#$%^&*(),.?":{}|<>]/.test(editingUser.password) ? 'text-green-600' : 'text-gray-500'}>One special character</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({ ...editingUser, role: value as User['role'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="HR Leader">HR Leader</SelectItem>
                    <SelectItem value="Functional Leader">Functional Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editDepartment">Department</Label>
                <Select value={editingUser.department} onValueChange={(value) => setEditingUser({ ...editingUser, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Research & Development">Research & Development</SelectItem>
                    <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select value={editingUser.status} onValueChange={(value) => setEditingUser({ ...editingUser, status: value as User['status'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="InActive">InActive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button 
                  onClick={handleUpdateUser}
                  disabled={!editingUser.name || !editingUser.password || !editingUser.role || !editingUser.department || !editingUser.status || !validatePassword(editingUser.password)}
                >
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={() => { }}>
        {/* <AlertDialogContent onPointerDownOutside={(e:any) => e.preventDefault()}> */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{userToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteUser} disabled={isLoading}>
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              {isLoading ? "Deleting..." : "Yes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

