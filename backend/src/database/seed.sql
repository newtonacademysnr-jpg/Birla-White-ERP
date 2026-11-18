-- ====================================================================
-- ADITYA BIRLA - UNIT BIRLA WHITE SALES ERP SEED DATA
-- ====================================================================

-- 1. Insert Stockists Master
INSERT INTO stockists (code, firm_name, contact_person, phone, email, gstin, pan, territory, zone, address_line1, address_line2, city, state, pincode, credit_limit, credit_days, status)
VALUES
('STK-BW-001', 'Rajasthan Cement & Chemicals Corp.', 'Sunil Agarwal', '+91 98290 12345', 'sunil@rajasthancement.com', '08AAACR1234F1Z8', 'AAACR1234F', 'Jaipur Central & North', 'North', 'Plot 45-B, Transport Nagar', 'Opp. Birla White Godown', 'Jaipur', 'Rajasthan', '302003', 2500000.00, 45, 'Active'),
('STK-BW-002', 'Shree Ganesh Building Solutions', 'Manoj Singhal', '+91 94150 98765', 'manoj@shreeganeshbuild.com', '09AABCS5678G1Z2', 'AABCS5678G', 'Lucknow & Barabanki', 'Central', 'Shop 12-14, Industrial Area Phase II', 'Near Shaheed Path', 'Lucknow', 'Uttar Pradesh', '226012', 2000000.00, 45, 'Active'),
('STK-BW-003', 'Gujarat White Cement Agencies', 'Hareshbhai Patel', '+91 98250 45678', 'haresh@gujaratwhite.com', '24AABCG9012H1Z5', 'AABCG9012H', 'Ahmedabad Metro & Gandhinagar', 'West', 'Sarkhej-Bawla Highway, Godown 7', 'Behind Ujala Circle', 'Ahmedabad', 'Gujarat', '382210', 3000000.00, 45, 'Active'),
('STK-BW-004', 'Capital Paint & Putty Traders', 'Virender Kumar Gupta', '+91 98110 33445', 'virender@capitalpaint.in', '07AACCP3456J1Z1', 'AACCP3456J', 'Delhi-NCR & Gurgaon', 'North', 'D-14, Kirti Nagar Industrial Area', 'Near Timber Market', 'New Delhi', 'Delhi', '110015', 3500000.00, 30, 'Active'),
('STK-BW-005', 'Malwa Building Materials & Depot', 'Dharmendra Jain', '+91 98260 77889', 'dharmendra@malwabuild.com', '23AABCM7890K1Z9', 'AABCM7890K', 'Indore & Ujjain Belt', 'Central', 'Scheme 78, Ring Road Depot', 'Near Loha Mandi', 'Indore', 'Madhya Pradesh', '452010', 1800000.00, 45, 'Active')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Retailers Master (Mapped to Stockists)
INSERT INTO retailers (code, firm_name, contact_person, phone, email, gstin, pan_aadhar, stockist_id, territory, address_line1, address_line2, city, state, pincode, credit_limit, credit_days, status)
VALUES
('RET-BW-101', 'Krishna Paint & Hardware Mart', 'Radhe Shyam Sharma', '+91 98291 11223', 'krishna.paint@gmail.com', '08AAEPK8821B1Z2', 'AAEPK8821B', 1, 'Jaipur Central', 'Shop No. 5, MI Road Market', 'Near Panch Batti', 'Jaipur', 'Rajasthan', '302001', 400000.00, 30, 'Active'),
('RET-BW-102', 'Gupta Sanitation & Decor House', 'Ramesh Chandra Gupta', '+91 98292 33445', 'gupta.sanitation@gmail.com', '08AABCG4412C1Z4', 'AABCG4412C', 1, 'Jaipur North', 'Plot 22, Vidyadhar Nagar', 'Sector 3 Main Market', 'Jaipur', 'Rajasthan', '302039', 500000.00, 30, 'Active'),
('RET-BW-103', 'Awadh Hardware & Color Center', 'Pradeep Srivastava', '+91 94151 55667', 'awadh.hardware@yahoo.com', '09AACPA3312D1Z7', 'AACPA3312D', 2, 'Lucknow Central', 'Shop 8, Hazratganj Complex', 'Opp. Multilevel Parking', 'Lucknow', 'Uttar Pradesh', '226001', 350000.00, 25, 'Active'),
('RET-BW-104', 'Gomti Builders & Paint Mart', 'Alok Pandey', '+91 94152 77889', 'gomti.builders@gmail.com', '09AABCP9912E1Z9', 'AABCP9912E', 2, 'Gomti Nagar', 'B-4/12, Vibhuti Khand', 'Near Kisan Bazaar', 'Lucknow', 'Uttar Pradesh', '226010', 450000.00, 30, 'Active'),
('RET-BW-105', 'Shivam Ceramic & White Putty Store', 'Nilesh Shah', '+91 98251 22334', 'shivam.ceramics@gmail.com', '24AAFPS6612F1Z1', 'AAFPS6612F', 3, 'Ahmedabad West', 'Shop 18, Titanium Square', 'Thaltej Cross Roads', 'Ahmedabad', 'Gujarat', '380054', 600000.00, 30, 'Active'),
('RET-BW-106', 'Maruti Enterprise & Hardware', 'Bhavin Trivedi', '+91 98252 44556', 'maruti.enterprise@gmail.com', '24AABCM2212G1Z3', 'AABCM2212G', 3, 'Gandhinagar', 'Sector 11, Shopping Center', 'Near GH Circle', 'Gandhinagar', 'Gujarat', '382011', 300000.00, 30, 'Active'),
('RET-BW-107', 'Metro Paint Gallery & Decor', 'Rakesh Chawla', '+91 98111 66778', 'metropaint.delhi@gmail.com', '07AADCM1112H1Z6', 'AADCM1112H', 4, 'Delhi West', 'J-12, Rajouri Garden Market', 'Main Ring Road', 'New Delhi', 'Delhi', '110027', 750000.00, 21, 'Active'),
('RET-BW-108', 'Maharaja Hardware & Building Store', 'Mahendra Singh', '+91 98261 88990', 'maharaja.indore@gmail.com', '23AABCM3312J1Z8', 'AABCM3312J', 5, 'Indore East', '56 Dukan Commercial Area', 'Shop No. 3', 'Indore', 'Madhya Pradesh', '452001', 350000.00, 30, 'Active')
ON CONFLICT (code) DO NOTHING;

-- 3. Insert Product Catalog
-- Unit Types: Bag, Bucket, Box, Manual
INSERT INTO products (sku, name, category, unit_type, packaging_size, base_price, hsn_code, gst_rate, min_order_qty, in_stock_qty, status, description)
VALUES
-- Bags
('BW-PRD-001', 'Birla White WallCare Putty (40 Kg)', 'Wall Putty', 'Bag', '40 Kg', 980.00, '32141000', 18.00, 10, 1200, 'Active', 'India #1 polymer modified white cement based wall putty for extra gloss and durability.'),
('BW-PRD-002', 'Birla White WallCare Putty (20 Kg)', 'Wall Putty', 'Bag', '20 Kg', 510.00, '32141000', 18.00, 10, 850, 'Active', 'Water-resistant white cement wall putty in convenient 20kg packing.'),
('BW-PRD-003', 'Birla White WallCare Putty (5 Kg)', 'Wall Putty', 'Bag', '5 Kg', 145.00, '32141000', 18.00, 20, 600, 'Active', 'Retail handy pack for touching up and small surface areas.'),
('BW-PRD-004', 'Birla White White Cement (50 Kg)', 'White Cement', 'Bag', '50 Kg', 1250.00, '25232100', 28.00, 5, 900, 'Active', 'The Whitest White Portland Cement with high whiteness index (>89% Hunter scale).'),
('BW-PRD-005', 'Birla White White Cement (25 Kg)', 'White Cement', 'Bag', '25 Kg', 660.00, '25232100', 28.00, 10, 750, 'Active', 'Standard 25kg packaging for architectural decorative finishes and terrazzo.'),
('BW-PRD-006', 'Birla White Levelplast (30 Kg)', 'Waterproofing Putty', 'Bag', '30 Kg', 720.00, '32141000', 18.00, 5, 400, 'Active', 'Water-resistant white coarse putty for undulation leveling up to 10mm.'),
('BW-PRD-007', 'Birla White Textura Spray Finish (25 Kg)', 'Textures', 'Bag', '25 Kg', 890.00, '32141000', 18.00, 5, 300, 'Active', 'Exterior textured finish with supreme water repellency and UV resistance.'),
('BW-PRD-008', 'Birla White Waterproof Putty (30 Kg)', 'Waterproofing Putty', 'Bag', '30 Kg', 840.00, '32141000', 18.00, 5, 520, 'Active', 'Active hydrophobic formulation protecting walls from dampness and efflorescence.'),

-- Buckets
('BW-PRD-009', 'Birla White Extocare Primer (20 Ltr)', 'Primers & Coats', 'Bucket', '20 Ltr', 2150.00, '32091000', 18.00, 2, 350, 'Active', 'Premium water-based exterior primer with superior opacity and adhesion.'),
('BW-PRD-010', 'Birla White Extocare Primer (10 Ltr)', 'Primers & Coats', 'Bucket', '10 Ltr', 1140.00, '32091000', 18.00, 4, 280, 'Active', 'Exterior wall primer bucket with anti-efflorescence and sealing properties.'),
('BW-PRD-011', 'Birla White PrimaCoat Primer (20 Ltr)', 'Primers & Coats', 'Bucket', '20 Ltr', 1850.00, '32091000', 18.00, 2, 420, 'Active', 'White cement based primer bucket for interior plaster and masonry.'),
('BW-PRD-012', 'Birla White Bio-Shield Anti-Fungal Putty (10 Ltr)', 'Wall Putty', 'Bucket', '10 Ltr', 1280.00, '32141000', 18.00, 2, 190, 'Active', 'Antiviral and anti-microbial wall putty in ready-to-use bucket.'),

-- Boxes
('BW-PRD-013', 'Birla White Grout Master Tile Grout (5 Kg)', 'Adhesives & Grouts', 'Box', '5 Kg', 320.00, '38245090', 18.00, 10, 450, 'Active', 'Polymer modified stain-resistant tile joint filler in sealed box packaging.'),
('BW-PRD-014', 'Birla White Grout Master Tile Grout (1 Kg)', 'Adhesives & Grouts', 'Box', '1 Kg', 75.00, '38245090', 18.00, 25, 800, 'Active', 'Compact 1kg box with moisture-proof liner for fine tile gaps.'),
('BW-PRD-015', 'Birla White Wall Seal Waterproof Coating (4 Ltr)', 'Waterproofing', 'Box', '4 Ltr Box', 960.00, '38244090', 18.00, 4, 260, 'Active', 'High elastomeric waterproof membrane boxed combo kit.'),

-- Manual (Custom/Bulk Unit)
('BW-PRD-016', 'Birla White Bulk Road Tanker White Cement (MT)', 'White Cement', 'Manual', 'Per Metric Ton (MT)', 19800.00, '25232100', 28.00, 1, 45, 'Active', 'Bulk supply in pneumatic road tankers for major infrastructure / RMC plants.')
ON CONFLICT (sku) DO NOTHING;

-- 4. Insert Sample Orders
INSERT INTO orders (id, order_number, retailer_id, stockist_id, order_date, expected_delivery_date, status, dispatch_status, subtotal, gst_total, total_amount, dispatched_amount, pending_amount, sales_officer, remarks)
VALUES
(1, 'BW-ORD-2026-001', 1, 1, '2026-11-10', '2026-11-12', 'Completed', 'Full', 115000.00, 20700.00, 135700.00, 135700.00, 0.00, 'Vikas Sharma (SO-Jaipur)', 'Urgent delivery for civil contractor project at MI Road.'),
(2, 'BW-ORD-2026-002', 2, 1, '2026-11-14', '2026-11-17', 'Processing', 'Partial', 184000.00, 33120.00, 217120.00, 130272.00, 86848.00, 'Vikas Sharma (SO-Jaipur)', 'Vehicle capacity limitation; remaining 40 bags scheduled for tomorrow.'),
(3, 'BW-ORD-2026-003', 3, 2, '2026-11-16', '2026-11-19', 'Confirmed', 'Pending', 92500.00, 16650.00, 109150.00, 0.00, 109150.00, 'Rajesh Verma (SO-Lucknow)', 'Pre-winter festive stock requirement.'),
(4, 'BW-ORD-2026-004', 5, 3, '2026-11-17', '2026-11-20', 'Confirmed', 'Out of Stock', 145000.00, 26100.00, 171100.00, 0.00, 171100.00, 'Amit Patel (SO-Ahmedabad)', 'Extocare 20L batch under quality testing at factory.')
ON CONFLICT (id) DO NOTHING;

-- Set sequence for orders
SELECT setval('orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM orders));

-- 5. Insert Order Items (With Manual Rate Entry applied!)
INSERT INTO order_items (order_id, product_id, product_name, unit_type, packaging_size, standard_price, manual_rate, ordered_qty, dispatched_qty, pending_qty, gst_rate, item_subtotal, item_gst, item_total)
VALUES
-- Order 1 Items (Completed - Full Dispatch)
(1, 1, 'Birla White WallCare Putty (40 Kg)', 'Bag', '40 Kg', 980.00, 940.00, 100, 100, 0, 18.00, 94000.00, 16920.00, 110920.00),
(1, 9, 'Birla White Extocare Primer (20 Ltr)', 'Bucket', '20 Ltr', 2150.00, 2100.00, 10, 10, 0, 18.00, 21000.00, 3780.00, 24780.00),

-- Order 2 Items (Partial Dispatch: 100 bags ordered, 60 dispatched, 40 pending)
(2, 1, 'Birla White WallCare Putty (40 Kg)', 'Bag', '40 Kg', 980.00, 920.00, 150, 90, 60, 18.00, 138000.00, 24840.00, 162840.00),
(2, 4, 'Birla White White Cement (50 Kg)', 'Bag', '50 Kg', 1250.00, 1150.00, 40, 40, 0, 28.00, 46000.00, 12880.00, 58880.00),

-- Order 3 Items (Pending)
(3, 1, 'Birla White WallCare Putty (40 Kg)', 'Bag', '40 Kg', 980.00, 925.00, 100, 0, 100, 18.00, 92500.00, 16650.00, 109150.00),

-- Order 4 Items (Out of Stock)
(4, 9, 'Birla White Extocare Primer (20 Ltr)', 'Bucket', '20 Ltr', 2150.00, 2050.00, 50, 0, 50, 18.00, 102500.00, 18450.00, 120950.00),
(4, 11, 'Birla White PrimaCoat Primer (20 Ltr)', 'Bucket', '20 Ltr', 1850.00, 1700.00, 25, 0, 25, 18.00, 42500.00, 7650.00, 50150.00);

-- 6. Insert Dispatch Records
INSERT INTO dispatch_records (id, dispatch_number, order_id, dispatch_type, dispatch_date, vehicle_no, driver_name, driver_contact, partial_reason, total_dispatched_qty, total_dispatched_amt, total_pending_qty, total_pending_amt, notes)
VALUES
(1, 'BW-DSP-2026-001', 1, 'Full', '2026-11-11 14:30:00', 'RJ-14-GC-5421', 'Ramesh Gurjar', '+91 97840 55432', NULL, 110, 135700.00, 0, 0.00, 'Dispatched fully in single commercial tempo.'),
(2, 'BW-DSP-2026-002', 2, 'Partial', '2026-11-15 16:10:00', 'RJ-14-EA-8812', 'Suresh Meena', '+91 98280 11987', 'Transporter vehicle load capacity exceeded. Remaining 60 bags of 40kg Putty dispatched next trip.', 130, 130272.00, 60, 86848.00, 'First installment delivered; retailer verified condition.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('dispatch_records_id_seq', (SELECT COALESCE(MAX(id), 1) FROM dispatch_records));

-- 7. Insert Dispatch Items
INSERT INTO dispatch_items (dispatch_id, order_item_id, product_id, product_name, unit_type, packaging_size, ordered_qty, dispatched_qty, pending_qty, manual_rate, dispatched_amount, pending_amount)
VALUES
(1, 1, 1, 'Birla White WallCare Putty (40 Kg)', 'Bag', '40 Kg', 100, 100, 0, 940.00, 110920.00, 0.00),
(1, 2, 9, 'Birla White Extocare Primer (20 Ltr)', 'Bucket', '20 Ltr', 10, 10, 0, 2100.00, 24780.00, 0.00),
(2, 3, 1, 'Birla White WallCare Putty (40 Kg)', 'Bag', '40 Kg', 150, 90, 60, 920.00, 97704.00, 65136.00),
(2, 4, 4, 'Birla White White Cement (50 Kg)', 'Bag', '50 Kg', 40, 40, 0, 1150.00, 58880.00, 0.00);

-- 8. Insert Payments Ledger & Transactions (Includes Overdue test entries)
INSERT INTO payments_ledger (id, transaction_number, entity_type, retailer_id, stockist_id, order_id, payment_date, amount, payment_type, payment_mode, reference_no, bank_name, notes)
VALUES
-- Invoices (Debits)
(1, 'BW-INV-2026-001', 'Retailer', 1, 1, 1, '2026-10-01', 135700.00, 'Debit', 'Credit Note', 'BW-ORD-2026-001', 'Birla White System', 'Invoice raised for MI Road delivery'),
(2, 'BW-INV-2026-002', 'Retailer', 2, 1, 2, '2026-10-15', 217120.00, 'Debit', 'Credit Note', 'BW-ORD-2026-002', 'Birla White System', 'Invoice raised for Vidyadhar Nagar project'),
(3, 'BW-INV-2026-003', 'Retailer', 7, 4, NULL, '2026-09-15', 310000.00, 'Debit', 'Credit Note', 'BW-ORD-OLD-098', 'Birla White System', 'Past quarter invoice (Testing overdue tracker: >60 days overdue)'),

-- Payments (Credits)
(4, 'BW-PAY-2026-001', 'Retailer', 1, 1, 1, '2026-10-20', 135700.00, 'Credit', 'NEFT/RTGS', 'UTR-HDFC0001928374', 'HDFC Bank', 'Full invoice payment cleared within credit period.'),
(5, 'BW-PAY-2026-002', 'Retailer', 2, 1, 2, '2026-11-05', 100000.00, 'Credit', 'UPI', 'UPI-9829233445@icici', 'ICICI Bank', 'Part payment received towards Vidyadhar Nagar order.'),
(6, 'BW-PAY-2026-003', 'Stockist', NULL, 1, NULL, '2026-11-08', 500000.00, 'Credit', 'NEFT/RTGS', 'UTR-SBIN00481928', 'State Bank of India', 'Stockist monthly running account reconciliation deposit.')
ON CONFLICT (id) DO NOTHING;

SELECT setval('payments_ledger_id_seq', (SELECT COALESCE(MAX(id), 1) FROM payments_ledger));

-- 9. Insert PJP Beats
INSERT INTO pjp_beats (id, beat_code, beat_name, sales_officer, territory, day_of_week, status)
VALUES
(1, 'PJP-JPR-MON', 'Jaipur Central - MI Road Beat', 'Vikas Sharma', 'Jaipur Central', 'Monday', 'Active'),
(2, 'PJP-JPR-TUE', 'Jaipur North - Vidyadhar & VKIA Beat', 'Vikas Sharma', 'Jaipur North', 'Tuesday', 'Active'),
(3, 'PJP-LKO-WED', 'Lucknow Hazratganj Commercial Beat', 'Rajesh Verma', 'Lucknow Central', 'Wednesday', 'Active'),
(4, 'PJP-LKO-THU', 'Gomti Nagar & Indiranagar Extension', 'Rajesh Verma', 'Gomti Nagar', 'Thursday', 'Active'),
(5, 'PJP-AHM-FRI', 'Ahmedabad SG Highway & Thaltej Beat', 'Amit Patel', 'Ahmedabad West', 'Friday', 'Active'),
(6, 'PJP-DEL-SAT', 'Delhi West & Rajouri Hardware Hub', 'Sunil Malhotra', 'Delhi West', 'Saturday', 'Active')
ON CONFLICT (id) DO NOTHING;

SELECT setval('pjp_beats_id_seq', (SELECT COALESCE(MAX(id), 1) FROM pjp_beats));

-- 10. Insert PJP Retailer Visits
INSERT INTO pjp_visits (beat_id, retailer_id, sales_officer, planned_date, actual_visit_date, visit_status, discussion_notes, order_booked_amt, payment_collected_amt, next_followup_date)
VALUES
(1, 1, 'Vikas Sharma', '2026-11-17', '2026-11-17', 'Order Booked', 'Met Radhe Shyam ji. Booked 100 bags Putty and discussed upcoming township project.', 110920.00, 0.00, '2026-11-24'),
(2, 2, 'Vikas Sharma', '2026-11-18', '2026-11-18', 'Payment Collected', 'Followed up on partial dispatch balance and collected ₹1,00,000 cheque/UPI.', 0.00, 100000.00, '2026-11-25'),
(3, 3, 'Rajesh Verma', '2026-11-19', NULL, 'Planned', 'Scheduled visit for White Cement bulk requirements and seasonal discount display.', 0.00, 0.00, '2026-11-26'),
(4, 4, 'Rajesh Verma', '2026-11-20', NULL, 'Planned', 'Quarterly review with Alok Pandey regarding Extocare primer sampling.', 0.00, 0.00, '2026-11-27'),
(5, 5, 'Amit Patel', '2026-11-21', NULL, 'Planned', 'Tile Grout & Waterproofing combo pack push with Nilesh Shah.', 0.00, 0.00, '2026-11-28'),
(6, 7, 'Sunil Malhotra', '2026-11-16', '2026-11-16', 'Visited', 'Discussed overdue payment of ₹3.10 Lakhs. Retailer promised settlement by month end.', 0.00, 0.00, '2026-11-23');
