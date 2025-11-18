import { createClient } from '../../lib/server';

export default async function DebugSupabase() {
  const supabase = await createClient();
  // 查询 instruments 表，返回 data 和 error
  const { data, error } = await supabase.from('todos').select();

  return (
    <div>
      <h2>Supabase Debug</h2>
      <pre>data: {JSON.stringify(data, null, 2)}</pre>
      <pre>error: {JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}
