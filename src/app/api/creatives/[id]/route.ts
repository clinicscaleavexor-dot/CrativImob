import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership before deleting
  const { data: creative } = await supabase
    .from("creatives")
    .select("id, user_id, image_url")
    .eq("id", id)
    .single();

  if (!creative) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (creative.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete from storage if stored in Supabase
  if (creative.image_url?.includes("/storage/v1/object/public/creatives/")) {
    const path = creative.image_url.split("/creatives/").pop();
    if (path) {
      await supabase.storage.from("creatives").remove([path]);
    }
  }

  const { error } = await supabase.from("creatives").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
