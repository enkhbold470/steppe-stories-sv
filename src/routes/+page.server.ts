import { supabase } from "$lib/supabaseClient";

export async function load() {
  const { data } = await supabase.from("profiles").select();
  // console.log(data);
  return {
    profiles: data ?? [],
  };
}