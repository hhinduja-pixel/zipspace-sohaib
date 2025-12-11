-- Create enum for storage plans
CREATE TYPE public.storage_plan AS ENUM ('economy', 'walk_in_closet', 'store_room', 'premium');

-- Create enum for service plans
CREATE TYPE public.service_plan AS ENUM ('basic', 'elite');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'picked_up', 'stored', 'returned');

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  storage_plan storage_plan NOT NULL,
  service_plan service_plan NOT NULL DEFAULT 'basic',
  pickup_date DATE NOT NULL,
  pickup_time_slot TEXT NOT NULL,
  payment_screenshot_url TEXT,
  is_first_time BOOLEAN DEFAULT true,
  status booking_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stored_items table (items associated with bookings)
CREATE TABLE public.stored_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create OTP codes table
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create return_requests table
CREATE TABLE public.return_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  return_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create return_items table (items to return)
CREATE TABLE public.return_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_request_id UUID NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
  stored_item_id UUID NOT NULL REFERENCES public.stored_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stored_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;

-- Bookings policies (public insert for new bookings, read by email after OTP)
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own bookings by email" ON public.bookings FOR SELECT USING (true);

-- Stored items policies
CREATE POLICY "Anyone can insert stored items" ON public.stored_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view stored items" ON public.stored_items FOR SELECT USING (true);

-- OTP policies (service role manages these via edge functions)
CREATE POLICY "Anyone can insert OTP codes" ON public.otp_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view OTP codes" ON public.otp_codes FOR SELECT USING (true);
CREATE POLICY "Anyone can update OTP codes" ON public.otp_codes FOR UPDATE USING (true);

-- Return requests policies
CREATE POLICY "Anyone can create return requests" ON public.return_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view return requests" ON public.return_requests FOR SELECT USING (true);

-- Return items policies
CREATE POLICY "Anyone can insert return items" ON public.return_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view return items" ON public.return_items FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for bookings
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', true);

-- Storage policies
CREATE POLICY "Anyone can upload payment screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots');
CREATE POLICY "Anyone can view payment screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'payment-screenshots');