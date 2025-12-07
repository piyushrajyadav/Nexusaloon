-- Enable Row Level Security on tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Stock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;

-- User Policies
-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Allow admins/staff to read all users (needed for management)
CREATE POLICY "Staff and Admins can read all users" ON "User"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "User" as u
      WHERE u.id = auth.uid()::text
      AND (u.role = 'ADMIN' OR u.role = 'STAFF')
    )
  );

-- Product Policies
-- Everyone can view products
CREATE POLICY "Public view products" ON "Product"
  FOR SELECT
  TO authenticated
  USING (true);

-- Only Admins can manage products
CREATE POLICY "Admins manage products" ON "Product"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" as u
      WHERE u.id = auth.uid()::text
      AND u.role = 'ADMIN'
    )
  );

-- Stock Policies
-- Only Admins and Staff can view/manage stock
CREATE POLICY "Staff/Admin manage stock" ON "Stock"
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "User" as u
      WHERE u.id = auth.uid()::text
      AND (u.role = 'ADMIN' OR u.role = 'STAFF')
    )
  );

-- Booking Policies
-- Users can see their own bookings
CREATE POLICY "Users see own bookings" ON "Booking"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Staff/Admins can see all bookings
CREATE POLICY "Staff/Admin see all bookings" ON "Booking"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "User" as u
      WHERE u.id = auth.uid()::text
      AND (u.role = 'ADMIN' OR u.role = 'STAFF')
    )
  );

-- Users can create bookings
CREATE POLICY "Users create bookings" ON "Booking"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");
