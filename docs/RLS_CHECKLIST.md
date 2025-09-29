# RLS Security Checklist — Healing Compass

## Row Level Security (RLS) Requirements

### ✅ All tables with RLS must have self read/write policies
- **profiles**: `user_id = auth.uid()`
- **flow_sessions**: `user_id = auth.uid()`
- **flow_events**: `user_id = auth.uid()`

### ✅ No select * across users
- Always filter by `auth.uid()` or rely on RLS + `maybeSingle()`
- Never query rows for other users
- Use RLS policies to enforce data isolation

### ✅ Never write secrets to the client bundle
- Only use `VITE_*` environment variables in client code
- Keep `RESEND_API_KEY` in serverless functions only
- Never expose database credentials to client

## Examples

### ✅ Good
```sql
-- RLS policy for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());
```

```javascript
// Client code - relies on RLS
const { data } = await supabase
  .from('profiles')
  .select('*')
  .maybeSingle() // RLS automatically filters by auth.uid()
```

### ❌ Bad
```javascript
// Never do this - bypasses RLS
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', 'some-other-user-id') // Security risk!

// Never expose secrets
const apiKey = process.env.RESEND_API_KEY // Only in serverless functions
```

## Security Checklist
- [ ] All tables have RLS enabled
- [ ] All tables have self read/write policies
- [ ] No cross-user queries in client code
- [ ] No secrets in client bundle
- [ ] All queries use RLS or explicit user_id filtering
