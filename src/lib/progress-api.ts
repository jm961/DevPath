import { getSupabase } from './supabase';

export async function toggleMarkResourceDoneApi({
  resourceId,
  resourceType,
  topicId,
}: {
  resourceId: string;
  resourceType: 'roadmap' | 'best-practice';
  topicId: string;
}) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if already marked as done
  const { data: existing } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', user.id)
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .eq('topic_id', topicId)
    .single();

  if (existing) {
    // Already done, so toggle it off (delete)
    await supabase
      .from('user_progress')
      .delete()
      .eq('id', existing.id);
  } else {
    // Not done yet, mark as done (insert)
    await supabase
      .from('user_progress')
      .insert({
        user_id: user.id,
        resource_type: resourceType,
        resource_id: resourceId,
        topic_id: topicId,
      });
  }

  return { status: 'ok' as const };
}

export async function getUserResourceProgressApi({
  resourceId,
  resourceType,
}: {
  resourceId: string;
  resourceType: 'roadmap' | 'best-practice';
}) {
  const supabase = getSupabase();
  if (!supabase) {
    return { done: [] };
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { done: [] };
  }

  // Get all completed topics for this resource
  const { data, error } = await supabase
    .from('user_progress')
    .select('topic_id')
    .eq('user_id', user.id)
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId);

  if (error) {
    console.error('Error fetching progress:', error);
    return { done: [] };
  }

  return {
    done: data?.map(item => item.topic_id) || [],
  };
}
