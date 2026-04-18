"use server";

import { createServerClient } from "@/lib/supabase/server-client";
import { revalidatePath } from "next/cache";
import { sanitizeUserContent } from "@/lib/bad-words";

export interface ListFormData {
  name: string;
  description: string;
  is_public: boolean;
  items: { movie_id: string }[];
}

export interface ListActionResult {
  success: boolean;
  error?: string;
  listId?: string;
}

/**
 * Create a new list with sanitized content
 */
export async function createList(data: ListFormData): Promise<ListActionResult> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be logged in to create a list" };
    }

    if (!data.name.trim()) {
      return { success: false, error: "List name is required" };
    }

    // Sanitize content for bad words
    const sanitizedName = await sanitizeUserContent(data.name.trim());
    const sanitizedDescription = data.description.trim() 
      ? await sanitizeUserContent(data.description.trim()) 
      : "";

    // Create the list
    const { data: newList, error: createError } = await supabase
      .from("lists")
      .insert({
        user_id: user.id,
        name: sanitizedName,
        description: sanitizedDescription,
        is_public: data.is_public,
      })
      .select()
      .single();

    if (createError) {
      console.error("[createList] Error:", createError);
      return { success: false, error: createError.message };
    }

    // Insert list items if any
    if (data.items.length > 0 && newList) {
      const itemsToInsert = data.items.map((item) => ({
        list_id: newList.id,
        movie_id: item.movie_id,
      }));

      const { error: itemsError } = await supabase
        .from("list_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("[createList] Error inserting items:", itemsError);
        return { success: false, error: "Failed to add movies to list" };
      }
    }

    revalidatePath("/lists");
    revalidatePath(`/list/${newList.id}`);

    return { success: true, listId: newList.id };
  } catch (error) {
    console.error("[createList] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing list with sanitized content
 */
export async function updateList(
  listId: string,
  data: ListFormData
): Promise<ListActionResult> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be logged in to update a list" };
    }

    if (!data.name.trim()) {
      return { success: false, error: "List name is required" };
    }

    // Sanitize content for bad words
    const sanitizedName = await sanitizeUserContent(data.name.trim());
    const sanitizedDescription = data.description.trim()
      ? await sanitizeUserContent(data.description.trim())
      : "";

    // Update the list
    const { error: updateError } = await supabase
      .from("lists")
      .update({
        name: sanitizedName,
        description: sanitizedDescription,
        is_public: data.is_public,
      })
      .eq("id", listId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[updateList] Error:", updateError);
      return { success: false, error: updateError.message };
    }

    // Delete existing items and insert new ones
    await supabase.from("list_items").delete().eq("list_id", listId);

    if (data.items.length > 0) {
      const itemsToInsert = data.items.map((item) => ({
        list_id: listId,
        movie_id: item.movie_id,
      }));

      const { error: itemsError } = await supabase
        .from("list_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("[updateList] Error inserting items:", itemsError);
        return { success: false, error: "Failed to update movies in list" };
      }
    }

    revalidatePath("/lists");
    revalidatePath(`/list/${listId}`);
    revalidatePath(`/list/${listId}/edit`);

    return { success: true, listId };
  } catch (error) {
    console.error("[updateList] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Post a comment on a list with sanitized content
 */
export async function postListComment(
  listId: string,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "You must be logged in to comment" };
    }

    if (!content.trim()) {
      return { success: false, error: "Comment cannot be empty" };
    }

    // Sanitize content for bad words
    const sanitizedContent = await sanitizeUserContent(content.trim());

    const { error } = await supabase.from("comments").insert({
      list_id: listId,
      user_id: user.id,
      body: sanitizedContent,
    });

    if (error) {
      console.error("[postListComment] Error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath(`/list/${listId}`);

    return { success: true };
  } catch (error) {
    console.error("[postListComment] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
