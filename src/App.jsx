import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
//import Listings from "./pages/Listings";
//import ListingDetail from "./pages/ListingDetail";
//import CreateListing from "./pages/CreateListing";
//import UpdateListing from "./pages/UpdateListing";
//import AddAvailability from "./pages/AddAvailability";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "./contexts/auth/AuthContext";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            {/**<Route path="/listings" element={<Listings />} />
            <Route path="/listings/:listingId" element={<ListingDetail />} />

            {/* protected routes for all authenticated users */}
            <Route element={<ProtectedRoute />}>
              {/**<Route path="/profile" element={<Profile />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route
                path="/update-listing/:listingId"
                element={<UpdateListing />}
              />*/}
              {/**<Route
                path="/add-availability/:listingId"
                element={<AddAvailability />}
              />*/}
            </Route>

            {/* protected routes for admins only */}
            <Route element={<ProtectedRoute requiredRoles={["ADMIN"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
