// React Query hooks for PropaAI Cloud data layer.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/integrations/supabase/db";
import { getDeviceId } from "@/lib/device";
import { Database } from "@/integrations/supabase/types";

export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type SavedRow = Database["public"]["Tables"]["saved_properties"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"];
export type Alert = Database["public"]["Tables"]["alerts"]["Row"];
export type Analysis = Database["public"]["Tables"]["analyses"]["Row"];
export type Verdict = "green" | "yellow" | "red";
export type Goal = "live" | "invest" | "rent" | "business";
export type AssignmentStatus =
  | "new" | "sent" | "viewed" | "interested" | "rejected" | "offer" | "closed";

const did = () => getDeviceId();

// ───────────── PROPERTIES ─────────────
export function useProperties(filters?: { verdict?: Verdict | null; goal?: Goal | null }) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      let q = db.from("properties").select("*").order("created_at", { ascending: false });
      if (filters?.verdict) q = q.eq("verdict", filters.verdict);
      if (filters?.goal) q = q.eq("goal", filters.goal);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProperty(id: string | null | undefined) {
  return useQuery({
    queryKey: ["property", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await db.from("properties").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Database["public"]["Tables"]["properties"]["Insert"]) => {
      const { data, error } = await db
        .from("properties")
        .insert({ ...input, owner_device_id: did() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["properties"] }),
  });
}

// ───────────── SAVED ─────────────
export function useSaved() {
  return useQuery({
    queryKey: ["saved"],
    queryFn: async () => {
      const { data, error } = await db
        .from("saved_properties")
        .select("*, property:properties(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useIsSaved(propertyId: string | null | undefined) {
  const { data } = useSaved();
  return !!data?.some((s) => s.property_id === propertyId);
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, save }: { propertyId: string; save: boolean }) => {
      if (save) {
        const { error } = await db
          .from("saved_properties")
          .insert({ device_id: did(), property_id: propertyId });
        if (error && !`${error.message}`.includes("duplicate")) throw error;
      } else {
        const { error } = await db
          .from("saved_properties")
          .delete()
          .eq("device_id", did())
          .eq("property_id", propertyId);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved"] }),
  });
}

export function useUpdateSavedNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes, tags }: { id: string; notes?: string; tags?: string[] }) => {
      const { error } = await db
        .from("saved_properties")
        .update({ notes, tags })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved"] }),
  });
}

// ───────────── CLIENTS ─────────────
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await db.from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useClient(id: string | null | undefined) {
  return useQuery({
    queryKey: ["client", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await db.from("clients").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });
}
export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Database["public"]["Tables"]["clients"]["Insert"], "device_id">) => {
      const { data, error } = await db
        .from("clients")
        .insert({ ...input, device_id: did() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}

// ───────────── ASSIGNMENTS ─────────────
export function useAssignments(clientId?: string | null) {
  return useQuery({
    queryKey: ["assignments", clientId ?? "all"],
    queryFn: async () => {
      let q = db
        .from("assignments")
        .select("*, property:properties(*), client:clients(*)")
        .order("created_at", { ascending: false });
      if (clientId) q = q.eq("client_id", clientId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { client_id: string; property_id: string; notes?: string }) => {
      const { data, error } = await db
        .from("assignments")
        .insert({ ...input, device_id: did(), status: "new" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}
export function useUpdateAssignmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AssignmentStatus }) => {
      const { error } = await db.from("assignments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assignments"] }),
  });
}

// ───────────── ALERTS ─────────────
export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data, error } = await db
        .from("alerts")
        .select("*, property:properties(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("alerts").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

// ───────────── ANALYSES ─────────────
export function useAnalyses() {
  return useQuery({
    queryKey: ["analyses"],
    queryFn: async () => {
      const { data, error } = await db
        .from("analyses")
        .select("*, property:properties(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useSaveAnalysis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Database["public"]["Tables"]["analyses"]["Insert"], "device_id">) => {
      const { data, error } = await db
        .from("analyses")
        .insert({ ...input, device_id: did() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["analyses"] }),
  });
}
