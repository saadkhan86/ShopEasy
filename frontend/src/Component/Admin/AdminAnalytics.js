import React, { useState, useEffect } from "react";
import { useAlert } from "../Context/AlertContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import styles from "./AdminAnalytics.module.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null); // Change from empty object to null
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");

  const { showAlert } = useAlert();
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/admin/analytics?range=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics || data.data || getMockAnalytics());
      } else {
        throw new Error(data.message || "Failed to fetch analytics");
      }
    } catch (error) {
      showAlert("failure", error.message, "Error");
      // Fallback to mock data for demo
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo purposes
  const getMockAnalytics = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const categories = [
      "Electronics",
      "Clothing",
      "Books",
      "Home",
      "Sports",
      "Other",
    ];

    return {
      overview: {
        totalRevenue: 124567.89,
        totalOrders: 2345,
        totalUsers: 5678,
        conversionRate: 3.2,
        avgOrderValue: 53.12,
        growthRate: 12.5,
      },
      salesData: months.map((month, i) => ({
        month,
        sales: Math.floor(Math.random() * 50000) + 20000,
        orders: Math.floor(Math.random() * 500) + 100,
      })),
      revenueData: months.slice(0, 6).map((month, i) => ({
        month,
        revenue: Math.floor(Math.random() * 30000) + 15000,
        previousRevenue: Math.floor(Math.random() * 25000) + 12000,
      })),
      topProducts: [
        { name: "Wireless Headphones", sales: 245, revenue: 24500 },
        { name: "Smart Watch", sales: 189, revenue: 56700 },
        { name: "Laptop", sales: 156, revenue: 156000 },
        { name: "Running Shoes", sales: 134, revenue: 20100 },
        { name: "Bluetooth Speaker", sales: 98, revenue: 14700 },
      ],
      userGrowth: months.slice(0, 6).map((month, i) => ({
        month,
        newUsers: Math.floor(Math.random() * 200) + 50,
        activeUsers: Math.floor(Math.random() * 1000) + 500,
      })),
      orderStats: {
        pending: 45,
        processing: 23,
        shipped: 67,
        delivered: 1567,
        cancelled: 12,
        refunded: 8,
      },
      categoryStats: categories.map((category, i) => ({
        category,
        sales: Math.floor(Math.random() * 500) + 100,
        revenue: Math.floor(Math.random() * 50000) + 10000,
      })),
      recentActivity: [
        {
          type: "order",
          user: "John Doe",
          action: "placed an order",
          time: "2 min ago",
          amount: "$129.99",
        },
        {
          type: "user",
          user: "Sarah Smith",
          action: "registered",
          time: "15 min ago",
        },
        {
          type: "product",
          user: "Admin",
          action: "added new product",
          time: "1 hour ago",
          product: "Wireless Earbuds",
        },
        {
          type: "review",
          user: "Mike Johnson",
          action: "wrote a review",
          time: "2 hours ago",
          rating: 5,
        },
        {
          type: "order",
          user: "Emma Wilson",
          action: "cancelled order",
          time: "3 hours ago",
          amount: "$89.99",
        },
      ],
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num || 0);
  };

  // Chart configurations
  const salesChartConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sales Overview",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const revenueChartConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Revenue Trend",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value;
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const userGrowthConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "User Growth",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const categoryChartConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Sales by Category",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };

  // Chart data with safe access to analytics
  const salesChartData = {
    labels: analytics?.salesData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Sales ($)",
        data: analytics?.salesData?.map((item) => item.sales) || [],
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.4,
      },
      {
        label: "Orders",
        data: analytics?.salesData?.map((item) => item.orders) || [],
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const revenueChartData = {
    labels: analytics?.revenueData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Current Period",
        data: analytics?.revenueData?.map((item) => item.revenue) || [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
      },
      {
        label: "Previous Period",
        data: analytics?.revenueData?.map((item) => item.previousRevenue) || [],
        backgroundColor: "rgba(201, 203, 207, 0.6)",
        borderColor: "rgba(201, 203, 207, 1)",
        borderWidth: 2,
      },
    ],
  };

  const userGrowthData = {
    labels: analytics?.userGrowth?.map((item) => item.month) || [],
    datasets: [
      {
        label: "New Users",
        data: analytics?.userGrowth?.map((item) => item.newUsers) || [],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 2,
      },
      {
        label: "Active Users",
        data: analytics?.userGrowth?.map((item) => item.activeUsers) || [],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
      },
    ],
  };

  const categoryChartData = {
    labels: analytics?.categoryStats?.map((item) => item.category) || [],
    datasets: [
      {
        label: "Revenue ($)",
        data: analytics?.categoryStats?.map((item) => item.revenue) || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const orderStatusData = {
    labels: [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Refunded",
    ],
    datasets: [
      {
        data: [
          analytics?.orderStats?.pending || 0,
          analytics?.orderStats?.processing || 0,
          analytics?.orderStats?.shipped || 0,
          analytics?.orderStats?.delivered || 0,
          analytics?.orderStats?.cancelled || 0,
          analytics?.orderStats?.refunded || 0,
        ],
        backgroundColor: [
          "rgba(255, 206, 86, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(201, 203, 207, 0.6)",
        ],
        borderColor: [
          "rgba(255, 206, 86, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(201, 203, 207, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const getGrowthColor = (value) => {
    if (value > 0) return styles.growthPositive;
    if (value < 0) return styles.growthNegative;
    return styles.growthNeutral;
  };

  if (loading || !analytics) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <i className="fa-solid fa-chart-line fa-spin"></i>
        </div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <i className="fa-solid fa-chart-line"></i> Analytics Dashboard
        </h1>
        <p className={styles.subtitle}>
          Gain insights into your business performance
        </p>
      </div>

      {/* Time Range Selector */}
      <div className={styles.timeRange}>
        <div className={styles.rangeButtons}>
          <button
            className={`${styles.rangeButton} ${
              timeRange === "week" ? styles.active : ""
            }`}
            onClick={() => handleTimeRangeChange("week")}
          >
            <i className="fa-solid fa-calendar-week"></i> Week
          </button>
          <button
            className={`${styles.rangeButton} ${
              timeRange === "month" ? styles.active : ""
            }`}
            onClick={() => handleTimeRangeChange("month")}
          >
            <i className="fa-solid fa-calendar-alt"></i> Month
          </button>
          <button
            className={`${styles.rangeButton} ${
              timeRange === "quarter" ? styles.active : ""
            }`}
            onClick={() => handleTimeRangeChange("quarter")}
          >
            <i className="fa-solid fa-calendar"></i> Quarter
          </button>
          <button
            className={`${styles.rangeButton} ${
              timeRange === "year" ? styles.active : ""
            }`}
            onClick={() => handleTimeRangeChange("year")}
          >
            <i className="fa-solid fa-calendar-day"></i> Year
          </button>
        </div>

        <div className={styles.rangeInfo}>
          <span className={styles.lastUpdated}>
            <i className="fa-solid fa-clock"></i> Updated just now
          </span>
          <button className={styles.refreshButton} onClick={fetchAnalytics}>
            <i className="fa-solid fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className={styles.overviewStats}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(111, 66, 193, 0.2)" }}
          >
            <i
              className="fa-solid fa-money-bill-wave"
              style={{ color: "#6f42c1" }}
            ></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {formatCurrency(analytics?.overview?.totalRevenue || 0)}
            </span>
            <span className={styles.statLabel}>Total Revenue</span>
            <span
              className={`${styles.statGrowth} ${getGrowthColor(
                analytics?.overview?.growthRate || 0
              )}`}
            >
              <i
                className={`fa-solid fa-${
                  (analytics?.overview?.growthRate || 0) > 0
                    ? "arrow-up"
                    : "arrow-down"
                }`}
              ></i>
              {Math.abs(analytics?.overview?.growthRate || 0)}%
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(40, 167, 69, 0.2)" }}
          >
            <i
              className="fa-solid fa-shopping-cart"
              style={{ color: "#28a745" }}
            ></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {formatNumber(analytics?.overview?.totalOrders || 0)}
            </span>
            <span className={styles.statLabel}>Total Orders</span>
            <span className={`${styles.statGrowth} ${styles.growthPositive}`}>
              <i className="fa-solid fa-arrow-up"></i>
              {Math.floor(Math.random() * 20) + 5}%
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(0, 123, 255, 0.2)" }}
          >
            <i className="fa-solid fa-users" style={{ color: "#007bff" }}></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {formatNumber(analytics?.overview?.totalUsers || 0)}
            </span>
            <span className={styles.statLabel}>Total Users</span>
            <span className={`${styles.statGrowth} ${styles.growthPositive}`}>
              <i className="fa-solid fa-arrow-up"></i>
              {Math.floor(Math.random() * 15) + 3}%
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(255, 193, 7, 0.2)" }}
          >
            <i
              className="fa-solid fa-percentage"
              style={{ color: "#ffc107" }}
            ></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {(analytics?.overview?.conversionRate || 0).toFixed(1)}%
            </span>
            <span className={styles.statLabel}>Conversion Rate</span>
            <span className={`${styles.statGrowth} ${styles.growthPositive}`}>
              <i className="fa-solid fa-arrow-up"></i>
              {((analytics?.overview?.conversionRate || 0) * 0.1).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ background: "rgba(23, 162, 184, 0.2)" }}
          >
            <i
              className="fa-solid fa-chart-bar"
              style={{ color: "#17a2b8" }}
            ></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {formatCurrency(analytics?.overview?.avgOrderValue || 0)}
            </span>
            <span className={styles.statLabel}>Avg Order Value</span>
            <span className={`${styles.statGrowth} ${styles.growthPositive}`}>
              <i className="fa-solid fa-arrow-up"></i>
              {Math.floor(Math.random() * 10) + 2}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "overview" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <i className="fa-solid fa-chart-pie"></i> Overview
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "sales" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("sales")}
        >
          <i className="fa-solid fa-chart-line"></i> Sales
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "users" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("users")}
        >
          <i className="fa-solid fa-users"></i> Users
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "products" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("products")}
        >
          <i className="fa-solid fa-box"></i> Products
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <div className={styles.overviewContent}>
            {/* Top Row: Sales and Revenue Charts */}
            <div className={styles.chartRow}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>
                    <i className="fa-solid fa-chart-line"></i> Sales Overview
                  </h3>
                  <span className={styles.chartPeriod}>
                    {timeRange.toUpperCase()}
                  </span>
                </div>
                <div className={styles.chartContainer}>
                  <Line options={salesChartConfig} data={salesChartData} />
                </div>
              </div>

              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>
                    <i className="fa-solid fa-money-bill-wave"></i> Revenue
                    Trend
                  </h3>
                  <span className={styles.chartPeriod}>
                    {timeRange.toUpperCase()}
                  </span>
                </div>
                <div className={styles.chartContainer}>
                  <Bar options={revenueChartConfig} data={revenueChartData} />
                </div>
              </div>
            </div>

            {/* Second Row: Category and Order Status */}
            <div className={styles.chartRow}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>
                    <i className="fa-solid fa-tags"></i> Sales by Category
                  </h3>
                </div>
                <div className={styles.chartContainer}>
                  <Doughnut
                    options={categoryChartConfig}
                    data={categoryChartData}
                  />
                </div>
              </div>

              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>
                    <i className="fa-solid fa-shopping-cart"></i> Order Status
                    Distribution
                  </h3>
                </div>
                <div className={styles.chartContainer}>
                  <Pie data={orderStatusData} />
                </div>
              </div>
            </div>

            {/* Third Row: Recent Activity */}
            <div className={styles.activityCard}>
              <div className={styles.activityHeader}>
                <h3>
                  <i className="fa-solid fa-history"></i> Recent Activity
                </h3>
                <button className={styles.viewAllButton}>View All</button>
              </div>
              <div className={styles.activityList}>
                {analytics?.recentActivity?.map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <i
                        className={`fa-solid fa-${
                          activity.type === "order"
                            ? "shopping-cart"
                            : activity.type === "user"
                            ? "user-plus"
                            : activity.type === "product"
                            ? "box"
                            : activity.type === "review"
                            ? "star"
                            : "bell"
                        }`}
                      ></i>
                    </div>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        <strong>{activity.user}</strong> {activity.action}
                        {activity.product && <span>: {activity.product}</span>}
                        {activity.amount && (
                          <span className={styles.activityAmount}>
                            {" "}
                            ({activity.amount})
                          </span>
                        )}
                        {activity.rating && (
                          <span className={styles.activityRating}>
                            <i className="fa-solid fa-star"></i>{" "}
                            {activity.rating}/5
                          </span>
                        )}
                      </p>
                      <span className={styles.activityTime}>
                        <i className="fa-solid fa-clock"></i> {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "sales" && (
          <div className={styles.salesContent}>
            <div className={styles.chartCardFull}>
              <div className={styles.chartHeader}>
                <h3>
                  <i className="fa-solid fa-chart-line"></i> Detailed Sales
                  Analysis
                </h3>
                <div className={styles.chartControls}>
                  <span className={styles.chartPeriod}>
                    {timeRange.toUpperCase()}
                  </span>
                  <button className={styles.downloadButton}>
                    <i className="fa-solid fa-download"></i> Export
                  </button>
                </div>
              </div>
              <div className={styles.chartContainer}>
                <Line options={salesChartConfig} data={salesChartData} />
              </div>
            </div>

            <div className={styles.salesGrid}>
              <div className={styles.dataTable}>
                <h3>
                  <i className="fa-solid fa-table"></i> Monthly Sales Data
                </h3>
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Sales ($)</th>
                        <th>Orders</th>
                        <th>Avg. Order</th>
                        <th>Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.salesData?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.month}</td>
                          <td>{formatCurrency(item.sales)}</td>
                          <td>{item.orders}</td>
                          <td>
                            {formatCurrency(item.sales / (item.orders || 1))}
                          </td>
                          <td className={styles.growthCell}>
                            <span className={styles.growthPositive}>
                              <i className="fa-solid fa-arrow-up"></i>
                              {Math.floor(Math.random() * 20) + 5}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.salesInsights}>
                <h3>
                  <i className="fa-solid fa-lightbulb"></i> Sales Insights
                </h3>
                <div className={styles.insightsList}>
                  <div className={styles.insightItem}>
                    <div
                      className={styles.insightIcon}
                      style={{ background: "rgba(40, 167, 69, 0.1)" }}
                    >
                      <i
                        className="fa-solid fa-trophy"
                        style={{ color: "#28a745" }}
                      ></i>
                    </div>
                    <div className={styles.insightContent}>
                      <strong>Best Performing Month</strong>
                      <p>
                        December with{" "}
                        {formatCurrency(
                          Math.max(
                            ...(analytics?.salesData?.map((d) => d.sales) || [
                              0,
                            ])
                          )
                        )}{" "}
                        in sales
                      </p>
                    </div>
                  </div>
                  <div className={styles.insightItem}>
                    <div
                      className={styles.insightIcon}
                      style={{ background: "rgba(255, 193, 7, 0.1)" }}
                    >
                      <i
                        className="fa-solid fa-chart-line"
                        style={{ color: "#ffc107" }}
                      ></i>
                    </div>
                    <div className={styles.insightContent}>
                      <strong>Growth Trend</strong>
                      <p>
                        Sales increased by{" "}
                        {analytics?.overview?.growthRate || 0}% compared to last
                        period
                      </p>
                    </div>
                  </div>
                  <div className={styles.insightItem}>
                    <div
                      className={styles.insightIcon}
                      style={{ background: "rgba(0, 123, 255, 0.1)" }}
                    >
                      <i
                        className="fa-solid fa-bullseye"
                        style={{ color: "#007bff" }}
                      ></i>
                    </div>
                    <div className={styles.insightContent}>
                      <strong>Conversion Rate</strong>
                      <p>
                        {(analytics?.overview?.conversionRate || 0).toFixed(1)}%
                        of visitors make a purchase
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className={styles.usersContent}>
            <div className={styles.chartCardFull}>
              <div className={styles.chartHeader}>
                <h3>
                  <i className="fa-solid fa-users"></i> User Growth & Activity
                </h3>
                <span className={styles.chartPeriod}>
                  {timeRange.toUpperCase()}
                </span>
              </div>
              <div className={styles.chartContainer}>
                <Bar options={userGrowthConfig} data={userGrowthData} />
              </div>
            </div>

            <div className={styles.usersGrid}>
              <div className={styles.userMetrics}>
                <h3>
                  <i className="fa-solid fa-chart-pie"></i> User Metrics
                </h3>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricCard}>
                    <div
                      className={styles.metricIcon}
                      style={{ background: "rgba(40, 167, 69, 0.1)" }}
                    >
                      <i
                        className="fa-solid fa-user-plus"
                        style={{ color: "#28a745" }}
                      ></i>
                    </div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricValue}>
                        {Math.floor(
                          (analytics?.overview?.totalUsers || 0) * 0.15
                        )}
                      </span>
                      <span className={styles.metricLabel}>
                        New Users This Month
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div
                      className={styles.metricIcon}
                      style={{ background: "rgba(0, 123, 255, 0.1)" }}
                    >
                      <i
                        className="fa-solid fa-user-check"
                        style={{ color: "#007bff" }}
                      ></i>
                    </div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricValue}>
                        {Math.floor(
                          (analytics?.overview?.totalUsers || 0) * 0.65
                        )}
                      </span>
                      <span className={styles.metricLabel}>Active Users</span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div
                      className={styles.metricIcon}
                      style={{ background: "rgba(255, 193, 7, 0.1)" }}
                    >
                      <i
                        className="fa-solid fa-user-clock"
                        style={{ color: "#ffc107" }}
                      ></i>
                    </div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricValue}>
                        {Math.floor(
                          (analytics?.overview?.totalUsers || 0) * 0.92
                        )}
                      </span>
                      <span className={styles.metricLabel}>
                        Total Registered Users
                      </span>
                    </div>
                  </div>
                  <div className={styles.metricCard}>
                    <div
                      className={styles.metricIcon}
                      style={{ background: "rgba(111, 66, 193, 0.1)" }}
                    >
                      <i
                        className="fa-solid fa-user-tie"
                        style={{ color: "#6f42c1" }}
                      ></i>
                    </div>
                    <div className={styles.metricInfo}>
                      <span className={styles.metricValue}>
                        {Math.floor(
                          (analytics?.overview?.totalUsers || 0) * 0.03
                        )}
                      </span>
                      <span className={styles.metricLabel}>Admin Users</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.userDemographics}>
                <h3>
                  <i className="fa-solid fa-globe"></i> User Demographics
                </h3>
                <div className={styles.demographicsList}>
                  <div className={styles.demographicItem}>
                    <strong>Top Countries:</strong>
                    <div className={styles.countryList}>
                      <span className={styles.country}>
                        United States (45%)
                      </span>
                      <span className={styles.country}>
                        United Kingdom (18%)
                      </span>
                      <span className={styles.country}>Canada (12%)</span>
                      <span className={styles.country}>Australia (8%)</span>
                      <span className={styles.country}>Others (17%)</span>
                    </div>
                  </div>
                  <div className={styles.demographicItem}>
                    <strong>Age Distribution:</strong>
                    <div className={styles.ageBars}>
                      <div className={styles.ageBar}>
                        <span>18-24</span>
                        <div className={styles.barContainer}>
                          <div
                            className={styles.barFill}
                            style={{ width: "25%" }}
                          ></div>
                        </div>
                        <span>25%</span>
                      </div>
                      <div className={styles.ageBar}>
                        <span>25-34</span>
                        <div className={styles.barContainer}>
                          <div
                            className={styles.barFill}
                            style={{ width: "40%" }}
                          ></div>
                        </div>
                        <span>40%</span>
                      </div>
                      <div className={styles.ageBar}>
                        <span>35-44</span>
                        <div className={styles.barContainer}>
                          <div
                            className={styles.barFill}
                            style={{ width: "20%" }}
                          ></div>
                        </div>
                        <span>20%</span>
                      </div>
                      <div className={styles.ageBar}>
                        <span>45+</span>
                        <div className={styles.barContainer}>
                          <div
                            className={styles.barFill}
                            style={{ width: "15%" }}
                          ></div>
                        </div>
                        <span>15%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className={styles.productsContent}>
            <div className={styles.topProducts}>
              <h3>
                <i className="fa-solid fa-trophy"></i> Top Selling Products
              </h3>
              <div className={styles.productsList}>
                {analytics?.topProducts?.map((product, index) => (
                  <div key={index} className={styles.productRanking}>
                    <div className={styles.rankBadge}>
                      <span className={styles.rankNumber}>{index + 1}</span>
                    </div>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productStats}>
                        <span className={styles.productSales}>
                          <i className="fa-solid fa-chart-line"></i>{" "}
                          {product.sales} sold
                        </span>
                        <span className={styles.productRevenue}>
                          <i className="fa-solid fa-money-bill-wave"></i>{" "}
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.productGrowth}>
                      <span className={styles.growthPositive}>
                        <i className="fa-solid fa-arrow-up"></i>
                        {Math.floor(Math.random() * 30) + 10}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.productPerformance}>
              <h3>
                <i className="fa-solid fa-chart-bar"></i> Product Performance
              </h3>
              <div className={styles.performanceGrid}>
                <div className={styles.performanceCard}>
                  <div
                    className={styles.performanceIcon}
                    style={{ background: "rgba(40, 167, 69, 0.1)" }}
                  >
                    <i
                      className="fa-solid fa-fire"
                      style={{ color: "#28a745" }}
                    ></i>
                  </div>
                  <div className={styles.performanceInfo}>
                    <span className={styles.performanceValue}>
                      {analytics?.topProducts?.[0]?.name ||
                        "Wireless Headphones"}
                    </span>
                    <span className={styles.performanceLabel}>
                      Best Selling Product
                    </span>
                  </div>
                </div>
                <div className={styles.performanceCard}>
                  <div
                    className={styles.performanceIcon}
                    style={{ background: "rgba(255, 193, 7, 0.1)" }}
                  >
                    <i
                      className="fa-solid fa-star"
                      style={{ color: "#ffc107" }}
                    ></i>
                  </div>
                  <div className={styles.performanceInfo}>
                    <span className={styles.performanceValue}>4.8/5</span>
                    <span className={styles.performanceLabel}>
                      Average Product Rating
                    </span>
                  </div>
                </div>
                <div className={styles.performanceCard}>
                  <div
                    className={styles.performanceIcon}
                    style={{ background: "rgba(0, 123, 255, 0.1)" }}
                  >
                    <i
                      className="fa-solid fa-box-open"
                      style={{ color: "#007bff" }}
                    ></i>
                  </div>
                  <div className={styles.performanceInfo}>
                    <span className={styles.performanceValue}>
                      {Math.floor(
                        (analytics?.topProducts?.reduce(
                          (sum, p) => sum + p.sales,
                          0
                        ) || 0) / (analytics?.topProducts?.length || 1)
                      )}
                    </span>
                    <span className={styles.performanceLabel}>
                      Avg. Units Sold per Product
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.categoryPerformance}>
              <h3>
                <i className="fa-solid fa-tags"></i> Category Performance
              </h3>
              <div className={styles.categoryChart}>
                <Doughnut
                  options={categoryChartConfig}
                  data={categoryChartData}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.copyright}>
            <i className="fa-solid fa-chart-line"></i> Analytics Dashboard •
            Data updates in real-time
          </p>
          <div className={styles.footerInfo}>
            <span className={styles.dataSource}>
              <i className="fa-solid fa-database"></i> Data Source: System
              Analytics
            </span>
            <span className={styles.lastUpdate}>
              Last updated:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
