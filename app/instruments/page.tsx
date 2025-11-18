import { createClient } from '../../lib/server';

export default async function Instruments() {
  const supabase = await createClient();
  const { data: todos } = await supabase.from("todos").select();

  return <pre>{JSON.stringify(todos, null, 2)}</pre>
}