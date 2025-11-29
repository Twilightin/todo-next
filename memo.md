```javascript

// React

🆘<TaskList task={t}/>
↓
<TaskList key={t.id} task={t} onToggle={onToggle} onDelete={onDelete}/>

🆘<span style={{textDecoration: {task.completed} ? "through-line" : "none"}}>
↓
<span style={{textDecoration: task.completed ? "line-through" : "none"}}>

🆘text = fromfront?.text;
↓
const text = fromfront?.text;

🆘async function handleDelete(id) {
    const response = await fetch(`/api/todos?id=${id}`)
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }
↓
async function handleDelete(id) {
    const response = await fetch(`/api/todos?id=${id}`, {
      method: "DELETE"
    })
    setTasks((prev) => prev.filter((task) => task.id !== id));

🆘async function handleToggle(id) {
    const response = await fetch(`/api/todos`, {
      method: "PATCH"
    })
↓
  async function handleToggle(id) {
    const response = await fetch(`/api/todos?id=${id}`, {
      method: "PATCH"
    })


if(!taskText.trim()) return
!""         // true (空字符串取反 = true)
!"hello"    // false (有内容取反 = false)

<input
type="checkbox"
checked={task.completed}
onChange={() => onToggle(task.id)}
/>


body: {text: taskText},
↓
body: JSON.stringify({text: taskText}),

const body = await req.json();
const {text} = body;  // ✅ 正确

const {text} = body || {};  // ✅ 安全
// 或
const text = body?.text;    // ✅ 也可以


const newTask = response.json()
↓
const newTask = await response.json()

await pool.query()
await response.json()
return NextResponse.json()

// ==================================================================================

-- 删除特定行
DELETE FROM table_name WHERE condition;

-- 删除所有行（保留表结构）
DELETE FROM table_name;

-- 1. 更新单个字段（切换完成状态）
UPDATE todos 
SET completed = true 
WHERE id = 1;

-- 2. 更新多个字段
UPDATE todos 
SET text = 'New task text', completed = true 
WHERE id = 1;

-- 3. 切换布尔值（取反）
UPDATE todos 
SET completed = NOT completed 
WHERE id = 1;

-- 4. 更新并返回更新后的数据
UPDATE todos 
SET completed = true 
WHERE id = 1 
RETURNING *;

-- 5. 根据条件更新多条记录
UPDATE todos 
SET completed = true 
WHERE id IN (1, 2, 3);

-- 6. 更新所有记录
UPDATE todos 
SET completed = false;

// Curl




```

export async function DELETE(req) {
  const body = await req.json()
  const {id} = body

  const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [id])
  return NextResponse.json(result.rows[0])
}

curl http://localhost:3000/api/todos
curl "http://localhost:3000/api/todos?id=1"

curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Learn Next.js"}'

curl -X DELETE "http://localhost:3000/api/todos?id=1"

curl -X DELETE http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":1}'

curl -X PATCH "http://localhost:3000/api/todos?id=1"

curl -X PATCH http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":3}'