import { forwardRef, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";

// Lazy load all pages for code splitting
const Index = lazy(() => import("@/pages/Index"));
const About = lazy(() => import("@/pages/About"));
const Places = lazy(() => import("@/pages/Places"));
const Experiences = lazy(() => import("@/pages/Experiences"));
const PlanVisit = lazy(() => import("@/pages/PlanVisit"));
const Articles = lazy(() => import("@/pages/Articles"));
const ArticleDetail = lazy(() => import("@/pages/ArticleDetail"));
const Restaurants = lazy(() => import("@/pages/Restaurants"));
const RestaurantDetail = lazy(() => import("@/pages/RestaurantDetail"));
const Tickets = lazy(() => import("@/pages/Tickets"));
const PlaceDetail = lazy(() => import("@/pages/PlaceDetail"));
const ExperienceDetail = lazy(() => import("@/pages/ExperienceDetail"));
const Events = lazy(() => import("@/pages/Events"));
const Contact = lazy(() => import("@/pages/Contact"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const OrderConfirmation = lazy(() => import("@/pages/OrderConfirmation"));
const CardPayment = lazy(() => import("@/pages/CardPayment"));
const CardOTP = lazy(() => import("@/pages/CardOTP"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminMessages = lazy(() => import("@/pages/admin/AdminMessages"));
const AdminBookings = lazy(() => import("@/pages/admin/AdminBookings"));
const AdminOrders = lazy(() => import("@/pages/admin/AdminOrders"));
const AdminVisitors = lazy(() => import("@/pages/admin/AdminVisitors"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminEventBookings = lazy(() => import("@/pages/admin/AdminEventBookings"));
const Install = lazy(() => import("@/pages/Install"));
const AdminInstall = lazy(() => import("@/pages/admin/AdminInstall"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const AnimatedRoutes = forwardRef<HTMLDivElement>((_, ref) => {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/places" element={<PageTransition><Places /></PageTransition>} />
          <Route path="/experiences" element={<PageTransition><Experiences /></PageTransition>} />
          <Route path="/plan" element={<PageTransition><PlanVisit /></PageTransition>} />
          <Route path="/articles" element={<PageTransition><Articles /></PageTransition>} />
          <Route path="/article/:id" element={<PageTransition><ArticleDetail /></PageTransition>} />
          <Route path="/restaurants" element={<PageTransition><Restaurants /></PageTransition>} />
          <Route path="/restaurant/:id" element={<PageTransition><RestaurantDetail /></PageTransition>} />
          <Route path="/tickets" element={<PageTransition><Tickets /></PageTransition>} />
          <Route path="/place/:id" element={<PageTransition><PlaceDetail /></PageTransition>} />
          <Route path="/experience/:id" element={<PageTransition><ExperienceDetail /></PageTransition>} />
          <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
          <Route path="/order-confirmation" element={<PageTransition><OrderConfirmation /></PageTransition>} />
          <Route path="/card-payment" element={<PageTransition><CardPayment /></PageTransition>} />
          <Route path="/card-otp" element={<PageTransition><CardOTP /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/install" element={<PageTransition><Install /></PageTransition>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="visitors" element={<AdminVisitors />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="event-bookings" element={<AdminEventBookings />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
});

AnimatedRoutes.displayName = "AnimatedRoutes";

export default AnimatedRoutes;
