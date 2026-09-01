export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VehicleOwnershipType = "JAJA" | "VENDOR";
export type VehicleStatus =
  | "ONBOARDING"
  | "INSPECTION"
  | "AVAILABLE"
  | "RESERVED"
  | "RENTED"
  | "RETURNING"
  | "MAINTENANCE"
  | "DOCUMENT_HOLD"
  | "INACTIVE";
export type RentalType = "B2C" | "B2B";
export type RentalStatus =
  | "RESERVED"
  | "ACTIVE"
  | "RETURNING"
  | "COMPLETED"
  | "CANCELLED"
  | "OVERDUE";
export type ContractStatus =
  | "DRAFT"
  | "ACTIVE"
  | "EXPIRING"
  | "COMPLETED"
  | "CANCELLED";
export type BillingCycleType = "MONTHLY" | "QUARTERLY" | "YEARLY" | "OTHER";
export type InspectionType =
  | "INITIAL"
  | "PRE_RENTAL"
  | "PERIODIC"
  | "RETURN"
  | "MAINTENANCE";
export type InspectionResult = "PASSED" | "FAILED" | "CONDITIONAL";
export type MaintenanceStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";
export type DocumentType = "STNK" | "KIR" | "INSURANCE" | "TAX" | "OTHER";
export type DocumentStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
export type CustomerType = "INDIVIDUAL" | "CORPORATE";
export type AllocationStatus =
  | "ALLOCATED"
  | "ACTIVE"
  | "MAINTENANCE"
  | "REPLACEMENT_REQUIRED"
  | "REPLACED"
  | "COMPLETED";
export type UserRole =
  | "ADMIN"
  | "OPERATIONS"
  | "FLEET"
  | "MAINTENANCE"
  | "INSPECTOR"
  | "SALES"
  | "MANAGER";

export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string;
          name: string;
          company_name: string;
          phone: string;
          email: string;
          address: string;
          contact_person: string;
          tax_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company_name: string;
          phone: string;
          email: string;
          address: string;
          contact_person: string;
          tax_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company_name?: string;
          phone?: string;
          email?: string;
          address?: string;
          contact_person?: string;
          tax_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          customer_type: CustomerType;
          full_name: string;
          phone: string;
          email: string;
          identity_type: string;
          identity_number: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_type?: CustomerType;
          full_name: string;
          phone: string;
          email: string;
          identity_type?: string;
          identity_number: string;
          address: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_type?: CustomerType;
          full_name?: string;
          phone?: string;
          email?: string;
          identity_type?: string;
          identity_number?: string;
          address?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      corporate_customers: {
        Row: {
          id: string;
          company_name: string;
          company_registration_number: string | null;
          tax_id: string | null;
          industry: string | null;
          city: string;
          address: string;
          phone: string;
          email: string;
          pic_name: string;
          pic_role: string;
          pic_phone: string;
          pic_email: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          company_registration_number?: string | null;
          tax_id?: string | null;
          industry?: string | null;
          city?: string;
          address: string;
          phone: string;
          email: string;
          pic_name: string;
          pic_role: string;
          pic_phone: string;
          pic_email: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          company_registration_number?: string | null;
          tax_id?: string | null;
          industry?: string | null;
          city?: string;
          address?: string;
          phone?: string;
          email?: string;
          pic_name?: string;
          pic_role?: string;
          pic_phone?: string;
          pic_email?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          license_number: string;
          license_type: string;
          license_expiry: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          license_number: string;
          license_type?: string;
          license_expiry: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          license_number?: string;
          license_type?: string;
          license_expiry?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          police_number: string;
          brand: string;
          model: string;
          variant: string | null;
          year: number;
          color: string;
          transmission: string;
          fuel_type: string;
          seat_capacity: number;
          vin: string | null;
          engine_number: string | null;
          ownership_type: VehicleOwnershipType;
          vendor_id: string | null;
          status: VehicleStatus;
          current_odometer: number;
          next_service_odometer: number | null;
          business_b2c_enabled: boolean;
          business_b2b_enabled: boolean;
          daily_rate_b2c: number | null;
          monthly_rate_b2b: number | null;
          location_city: string;
          location_area: string;
          gps_device_id: string | null;
          current_location_lat: number | null;
          current_location_lng: number | null;
          last_gps_update: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          police_number: string;
          brand: string;
          model: string;
          variant?: string | null;
          year: number;
          color: string;
          transmission?: string;
          fuel_type?: string;
          seat_capacity?: number;
          vin?: string | null;
          engine_number?: string | null;
          ownership_type?: VehicleOwnershipType;
          vendor_id?: string | null;
          status?: VehicleStatus;
          current_odometer?: number;
          next_service_odometer?: number | null;
          business_b2c_enabled?: boolean;
          business_b2b_enabled?: boolean;
          daily_rate_b2c?: number | null;
          monthly_rate_b2b?: number | null;
          location_city?: string;
          location_area?: string;
          gps_device_id?: string | null;
          current_location_lat?: number | null;
          current_location_lng?: number | null;
          last_gps_update?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          police_number?: string;
          brand?: string;
          model?: string;
          variant?: string | null;
          year?: number;
          color?: string;
          transmission?: string;
          fuel_type?: string;
          seat_capacity?: number;
          vin?: string | null;
          engine_number?: string | null;
          ownership_type?: VehicleOwnershipType;
          vendor_id?: string | null;
          status?: VehicleStatus;
          current_odometer?: number;
          next_service_odometer?: number | null;
          business_b2c_enabled?: boolean;
          business_b2b_enabled?: boolean;
          daily_rate_b2c?: number | null;
          monthly_rate_b2b?: number | null;
          location_city?: string;
          location_area?: string;
          gps_device_id?: string | null;
          current_location_lat?: number | null;
          current_location_lng?: number | null;
          last_gps_update?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      corporate_contracts: {
        Row: {
          id: string;
          contract_number: string;
          corporate_customer_id: string;
          start_date: string;
          end_date: string;
          status: ContractStatus;
          billing_cycle: BillingCycleType;
          monthly_billing_amount: number;
          payment_term: string;
          required_vehicle_count: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_number: string;
          corporate_customer_id: string;
          start_date: string;
          end_date: string;
          status?: ContractStatus;
          billing_cycle?: BillingCycleType;
          monthly_billing_amount?: number;
          payment_term?: string;
          required_vehicle_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contract_number?: string;
          corporate_customer_id?: string;
          start_date?: string;
          end_date?: string;
          status?: ContractStatus;
          billing_cycle?: BillingCycleType;
          monthly_billing_amount?: number;
          payment_term?: string;
          required_vehicle_count?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contract_vehicle_requirements: {
        Row: {
          id: string;
          contract_id: string;
          vehicle_type: string;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          vehicle_type: string;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          vehicle_type?: string;
          quantity?: number;
          created_at?: string;
        };
      };
      rentals: {
        Row: {
          id: string;
          rental_number: string;
          rental_type: RentalType;
          customer_id: string | null;
          corporate_customer_id: string | null;
          contract_id: string | null;
          start_date: string;
          end_date: string;
          actual_return_date: string | null;
          status: RentalStatus;
          with_driver: boolean;
          driver_id: string | null;
          pickup_location: string;
          dropoff_location: string;
          total_amount: number;
          deposit_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rental_number: string;
          rental_type: RentalType;
          customer_id?: string | null;
          corporate_customer_id?: string | null;
          contract_id?: string | null;
          start_date: string;
          end_date: string;
          actual_return_date?: string | null;
          status?: RentalStatus;
          with_driver?: boolean;
          driver_id?: string | null;
          pickup_location?: string;
          dropoff_location?: string;
          total_amount?: number;
          deposit_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rental_number?: string;
          rental_type?: RentalType;
          customer_id?: string | null;
          corporate_customer_id?: string | null;
          contract_id?: string | null;
          start_date?: string;
          end_date?: string;
          actual_return_date?: string | null;
          status?: RentalStatus;
          with_driver?: boolean;
          driver_id?: string | null;
          pickup_location?: string;
          dropoff_location?: string;
          total_amount?: number;
          deposit_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rental_vehicles: {
        Row: {
          id: string;
          rental_id: string;
          vehicle_id: string;
          assigned_at: string;
          returned_at: string | null;
          starting_odometer: number;
          ending_odometer: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rental_id: string;
          vehicle_id: string;
          assigned_at?: string;
          returned_at?: string | null;
          starting_odometer?: number;
          ending_odometer?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rental_id?: string;
          vehicle_id?: string;
          assigned_at?: string;
          returned_at?: string | null;
          starting_odometer?: number;
          ending_odometer?: number | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      contract_vehicle_allocations: {
        Row: {
          id: string;
          contract_id: string;
          vehicle_id: string;
          allocated_at: string;
          deployed_at: string | null;
          returned_at: string | null;
          status: AllocationStatus;
          is_replacement: boolean;
          replacement_for_allocation_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_id: string;
          vehicle_id: string;
          allocated_at?: string;
          deployed_at?: string | null;
          returned_at?: string | null;
          status?: AllocationStatus;
          is_replacement?: boolean;
          replacement_for_allocation_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contract_id?: string;
          vehicle_id?: string;
          allocated_at?: string;
          deployed_at?: string | null;
          returned_at?: string | null;
          status?: AllocationStatus;
          is_replacement?: boolean;
          replacement_for_allocation_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inspections: {
        Row: {
          id: string;
          vehicle_id: string;
          rental_id: string | null;
          inspection_type: InspectionType;
          inspection_date: string;
          inspector_name: string;
          odometer: number;
          result: InspectionResult;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          rental_id?: string | null;
          inspection_type?: InspectionType;
          inspection_date?: string;
          inspector_name: string;
          odometer?: number;
          result?: InspectionResult;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          rental_id?: string | null;
          inspection_type?: InspectionType;
          inspection_date?: string;
          inspector_name?: string;
          odometer?: number;
          result?: InspectionResult;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inspection_items: {
        Row: {
          id: string;
          inspection_id: string;
          category: string;
          item_name: string;
          status: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          inspection_id: string;
          category: string;
          item_name: string;
          status?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          inspection_id?: string;
          category?: string;
          item_name?: string;
          status?: boolean;
          notes?: string | null;
          created_at?: string;
        };
      };
      maintenance_records: {
        Row: {
          id: string;
          vehicle_id: string;
          maintenance_type: string;
          status: MaintenanceStatus;
          scheduled_date: string | null;
          started_at: string | null;
          completed_at: string | null;
          odometer: number;
          next_service_odometer: number | null;
          workshop_name: string;
          workshop_location: string | null;
          description: string;
          cost: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          maintenance_type?: string;
          status?: MaintenanceStatus;
          scheduled_date?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          odometer?: number;
          next_service_odometer?: number | null;
          workshop_name: string;
          workshop_location?: string | null;
          description: string;
          cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          maintenance_type?: string;
          status?: MaintenanceStatus;
          scheduled_date?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          odometer?: number;
          next_service_odometer?: number | null;
          workshop_name?: string;
          workshop_location?: string | null;
          description?: string;
          cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      maintenance_items: {
        Row: {
          id: string;
          maintenance_id: string;
          item_name: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          maintenance_id: string;
          item_name: string;
          quantity?: number;
          unit_cost?: number;
          total_cost?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          maintenance_id?: string;
          item_name?: string;
          quantity?: number;
          unit_cost?: number;
          total_cost?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      vehicle_documents: {
        Row: {
          id: string;
          vehicle_id: string;
          document_type: DocumentType;
          document_number: string;
          issued_date: string;
          expiry_date: string;
          file_url: string | null;
          cost_to_renew: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          document_type: DocumentType;
          document_number: string;
          issued_date: string;
          expiry_date: string;
          file_url?: string | null;
          cost_to_renew?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          document_type?: DocumentType;
          document_number?: string;
          issued_date?: string;
          expiry_date?: string;
          file_url?: string | null;
          cost_to_renew?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      gps_devices: {
        Row: {
          id: string;
          vehicle_id: string | null;
          device_serial: string;
          provider: string;
          status: string;
          installed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id?: string | null;
          device_serial: string;
          provider?: string;
          status?: string;
          installed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string | null;
          device_serial?: string;
          provider?: string;
          status?: string;
          installed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      gps_locations: {
        Row: {
          id: string;
          vehicle_id: string;
          gps_device_id: string | null;
          latitude: number;
          longitude: number;
          speed: number;
          heading: string | null;
          odometer: number | null;
          battery_level: number;
          ignition: boolean;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          gps_device_id?: string | null;
          latitude: number;
          longitude: number;
          speed?: number;
          heading?: string | null;
          odometer?: number | null;
          battery_level?: number;
          ignition?: boolean;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          gps_device_id?: string | null;
          latitude?: number;
          longitude?: number;
          speed?: number;
          heading?: string | null;
          odometer?: number | null;
          battery_level?: number;
          ignition?: boolean;
          recorded_at?: string;
          created_at?: string;
        };
      };
      vehicle_history: {
        Row: {
          id: string;
          vehicle_id: string;
          event_type: string;
          event_date: string;
          title: string;
          reference_type: string | null;
          reference_id: string | null;
          description: string;
          actor: string | null;
          odometer: number | null;
          tag: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          event_type: string;
          event_date?: string;
          title: string;
          reference_type?: string | null;
          reference_id?: string | null;
          description: string;
          actor?: string | null;
          odometer?: number | null;
          tag?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          event_type?: string;
          event_date?: string;
          title?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string;
          actor?: string | null;
          odometer?: number | null;
          tag?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      fleet_summary: {
        Row: {
          total: number;
          available: number;
          rented: number;
          reserved: number;
          maintenance: number;
          inspection: number;
          document_hold: number;
          inactive: number;
          jaja_owned: number;
          vendor_owned: number;
        };
      };
      corporate_fleet_status: {
        Row: {
          contract_id: string;
          contract_number: string;
          corporate_customer_id: string;
          customer_name: string;
          contract_status: ContractStatus;
          start_date: string;
          end_date: string;
          monthly_billing_amount: number;
          required_units: number;
          allocated_units: number;
          operational_units: number;
          maintenance_units: number;
          replacement_units: number;
          shortage_count: number;
          replacement_required: boolean;
        };
      };
      document_expiry_summary: {
        Row: {
          expired: number;
          expires_7_days: number;
          expires_30_days: number;
          expires_90_days: number;
          active_valid: number;
        };
      };
      vehicle_operational_summary: {
        Row: {
          id: string;
          police_number: string;
          brand: string;
          model: string;
          variant: string | null;
          year: number;
          color: string;
          transmission: string;
          fuel_type: string;
          seat_capacity: number;
          vin: string | null;
          engine_number: string | null;
          ownership_type: VehicleOwnershipType;
          vendor_name: string | null;
          status: VehicleStatus;
          current_odometer: number;
          next_service_odometer: number | null;
          business_b2c_enabled: boolean;
          business_b2b_enabled: boolean;
          daily_rate_b2c: number | null;
          monthly_rate_b2b: number | null;
          location_city: string;
          location_area: string;
          current_location_lat: number | null;
          current_location_lng: number | null;
          last_gps_update: string | null;
          document_health: "OK" | "EXPIRING_SOON" | "EXPIRED";
          maintenance_health: "OK" | "DUE" | "OVERDUE" | "IN_PROGRESS";
          current_rental_id: string | null;
          current_rental_number: string | null;
          current_rental_type: RentalType | null;
          current_customer_name: string | null;
          current_driver_name: string | null;
        };
      };
    };
  };
}

