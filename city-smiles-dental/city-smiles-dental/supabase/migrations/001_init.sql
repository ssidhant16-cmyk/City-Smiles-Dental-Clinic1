-- ============================================================
--  City Smiles Dental Clinic — Initial Schema
--  Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PATIENTS
-- ─────────────────────────────────────────
create table patients (
  id            uuid primary key default uuid_generate_v4(),
  first_name    text not null,
  last_name     text not null,
  date_of_birth date,
  gender        text check (gender in ('Male','Female','Other')),
  phone         text,
  email         text,
  address       text,
  blood_group   text,
  allergies     text,
  medical_notes text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index idx_patients_name on patients (last_name, first_name);
create index idx_patients_phone on patients (phone);

-- ─────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────
create table appointments (
  id            uuid primary key default uuid_generate_v4(),
  patient_id    uuid not null references patients(id) on delete cascade,
  title         text not null,
  appointment_date date not null,
  appointment_time time not null,
  duration_mins int default 30,
  status        text default 'scheduled' check (status in ('scheduled','completed','cancelled','no-show')),
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
create index idx_appt_date on appointments (appointment_date);
create index idx_appt_patient on appointments (patient_id);

-- ─────────────────────────────────────────
-- TREATMENTS
-- ─────────────────────────────────────────
create table treatments (
  id            uuid primary key default uuid_generate_v4(),
  patient_id    uuid not null references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  procedure_name text not null,
  tooth_number  text,
  description   text,
  status        text default 'planned' check (status in ('planned','in-progress','completed')),
  cost          numeric(10,2) default 0,
  visit_notes   text,
  performed_at  date default current_date,
  created_at    timestamptz default now()
);
create index idx_treatments_patient on treatments (patient_id);

-- ─────────────────────────────────────────
-- PRESCRIPTIONS
-- ─────────────────────────────────────────
create table prescriptions (
  id            uuid primary key default uuid_generate_v4(),
  patient_id    uuid not null references patients(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete set null,
  prescribed_date date default current_date,
  notes         text,
  created_at    timestamptz default now()
);

create table prescription_items (
  id              uuid primary key default uuid_generate_v4(),
  prescription_id uuid not null references prescriptions(id) on delete cascade,
  medicine_name   text not null,
  dosage          text not null,
  frequency       text not null,
  duration        text not null,
  instructions    text
);
create index idx_rx_patient on prescriptions (patient_id);

-- ─────────────────────────────────────────
-- INVENTORY
-- ─────────────────────────────────────────
create table inventory (
  id            uuid primary key default uuid_generate_v4(),
  item_name     text not null,
  category      text,
  quantity      int not null default 0,
  unit          text default 'pcs',
  low_stock_threshold int default 10,
  cost_per_unit numeric(10,2) default 0,
  supplier      text,
  notes         text,
  last_restocked date,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ─────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_patients_updated before update on patients
  for each row execute function update_updated_at();
create trigger trg_appointments_updated before update on appointments
  for each row execute function update_updated_at();
create trigger trg_inventory_updated before update on inventory
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────
-- SAMPLE DATA
-- ─────────────────────────────────────────
insert into patients (first_name,last_name,date_of_birth,gender,phone,email,blood_group,allergies)
values
  ('Ahmed','Hassan','1985-03-12','Male','0501234567','ahmed.hassan@email.com','O+','Penicillin'),
  ('Sara','Al-Rashid','1992-07-24','Female','0557654321','sara.r@email.com','A+',null),
  ('Mohammed','Al-Farsi','1978-11-05','Male','0531112222','m.farsi@email.com','B+','Aspirin'),
  ('Fatima','Khalid','2001-01-30','Female','0561234444','fatima.k@email.com','AB-',null),
  ('Omar','Ibrahim','1965-09-18','Male','0509876543','omar.ib@email.com','O-','Latex');

insert into inventory (item_name,category,quantity,unit,low_stock_threshold,cost_per_unit)
values
  ('Dental Gloves (M)','Consumables',45,'box',5,35.00),
  ('Examination Gloves (S)','Consumables',8,'box',10,30.00),
  ('Composite Resin A2','Materials',12,'syringe',5,120.00),
  ('Dental Floss','Consumables',3,'roll',10,15.00),
  ('Anesthesia Cartridges','Medication',60,'pcs',20,8.50),
  ('Gauze Pads','Consumables',200,'pcs',50,0.75),
  ('Saliva Ejectors','Consumables',150,'pcs',30,0.50),
  ('X-Ray Film','Imaging',25,'sheet',10,12.00);
