"use client";

import { useEffect, useState } from "react";
import {
 
  
  BarChart3,
  Wallet,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { TranslationFn } from "@/providers/LanguageContext";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

// Mock data - replace with actual data from your backend
const mockAnalyticsData = {
  closedOrders: 28,
  totalCommissionOwed: 82300, // What we owe the broker
  allOrders: [
    {
      id: "ORD-001",
      carTitle: "BMW 320i 2020",
      clientName: "Ahmed Benali",
      orderDate: "2025-09-20",
      status: "closed",
      commission: 4500,
      price: 45000,
    },
    {
      id: "ORD-002", 
      carTitle: "Mercedes C200 2019",
      clientName: "Fatima Khelifi",
      orderDate: "2025-09-18",
      status: "pending",
      commission: 5200,
      price: 52000,
    },
    {
      id: "ORD-003",
      carTitle: "Audi A4 2021",
      clientName: "Karim Mansouri",
      orderDate: "2025-09-15",
      status: "closed",
      commission: 6800,
      price: 68000,
    },
    {
      id: "ORD-004",
      carTitle: "Toyota Camry 2020",
      clientName: "Amina Hadji",
      orderDate: "2025-09-12",
      status: "cancelled",
      commission: 0,
      price: 38000,
    },
    {
      id: "ORD-005",
      carTitle: "Honda Accord 2021",
      clientName: "Omar Saidi",
      orderDate: "2025-09-10",
      status: "closed",
      commission: 4200,
      price: 42000,
    },
    {
      id: "ORD-006",
      carTitle: "Volkswagen Passat 2020",
      clientName: "Sarah Belkacem",
      orderDate: "2025-09-08",
      status: "pending",
      commission: 3800,
      price: 38000,
    },
    {
      id: "ORD-007",
      carTitle: "Hyundai Elantra 2022",
      clientName: "Youssef Rami",
      orderDate: "2025-09-05",
      status: "closed",
      commission: 3500,
      price: 35000,
    },
    {
      id: "ORD-008",
      carTitle: "Nissan Altima 2019",
      clientName: "Leila Bouali",
      orderDate: "2025-09-03",
      status: "cancelled",
      commission: 0,
      price: 32000,
    },
    {
      id: "ORD-009",
      carTitle: "Ford Focus 2021",
      clientName: "Rachid Meziane",
      orderDate: "2025-09-01",
      status: "closed",
      commission: 2900,
      price: 29000,
    },
    {
      id: "ORD-010",
      carTitle: "Peugeot 308 2020",
      clientName: "Nadia Cherkaoui",
      orderDate: "2025-08-28",
      status: "pending",
      commission: 3200,
      price: 32000,
    },
  ]
};

const OrderCard: React.FC<{
  order: any;
  isRtl: boolean;
}> = ({ order, isRtl }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "closed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 border border-blue-100 hover:shadow-lg transition-all duration-300">
      {/* Header - Car Title and Status */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate pr-2">{order.carTitle}</h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {getStatusIcon(order.status)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>
      
      {/* Client Name */}
      <div className="mb-3">
        <p className="text-xs text-gray-500">Client</p>
        <p className="text-sm font-medium text-gray-700">{order.clientName}</p>
      </div>
      
      {/* Details Grid - 2x2 on mobile */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500 mb-1">Date</p>
          <p className="font-medium text-gray-700">{order.orderDate}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Price</p>
          <p className="font-medium text-gray-700">{(order.price / 1000).toFixed(0)}K DZD</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Order ID</p>
          <p className="font-medium text-gray-700">{order.id}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Commission</p>
          <p className={`font-medium ${order.commission > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {order.commission > 0 ? `${(order.commission / 1000).toFixed(1)}K DZD` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

const BrokerAnalyticsPage: React.FC = () => {
  const { t, isRtl } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const ordersPerPage = 6;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, router, loading]);

  const data = mockAnalyticsData;

  // Filter orders based on status
  const filteredOrders = data.allOrders.filter(order => 
    statusFilter === "all" || order.status === statusFilter
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <div
      className={`min-h-screen bg-gray-50 ${isRtl ? "rtl" : "ltr"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6">
          {/* Dashboard Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              Broker Analytics
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track your sales performance and commissions
            </p>
          </div>

          {/* Essential Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">Commission Owed</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {(data.totalCommissionOwed / 1000).toFixed(0)}K DZD
                  </p>
                  <p className="text-xs text-green-600 mt-1">Pending payment</p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">Orders Closed</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{data.closedOrders}</p>
                  <p className="text-xs text-blue-600 mt-1">Successfully completed</p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-800" />
                </div>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-800" />
                Your Orders ({filteredOrders.length})
              </h3>
              <div className="flex gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
                >
                  <option value="all">All Status</option>
                  <option value="closed">Closed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            {/* Orders Grid - Single column on mobile, multi-column on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {paginatedOrders.map((order) => (
                <OrderCard key={order.id} order={order} isRtl={isRtl} />
              ))}
            </div>

            {/* Mobile-Friendly Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-2 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                {/* Mobile: Show simplified pagination */}
                <div className="flex items-center gap-2 sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>

                {/* Desktop: Show full pagination */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-blue-800 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {statusFilter === "all" 
                    ? "You haven't registered any orders yet" 
                    : `No ${statusFilter} orders found`
                  }
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer t={t} isRtl={isRtl} />
    </div>
  );
};

export default BrokerAnalyticsPage;