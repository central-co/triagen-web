Livekit API Docs: 
- https://docs.livekit.io
- https://docs.livekit.io/home/client/connect/
- https://docs.livekit.io/home/client/tracks/
- https://docs.livekit.io/home/client/state/
- https://docs.livekit.io/home/client/state/participant-attributes/
- https://docs.livekit.io/home/client/state/room-metadata/
- https://docs.livekit.io/home/client/events/
- https://docs.livekit.io/home/quickstarts/react/
- https://docs.livekit.io/reference/
- https://docs.livekit.io/reference/components/react/
- 

Favor existing components over creating new ones.

Before creating a new component, check if an existing component can satisfy the requirements through its props and parameters.

Bad:
```tsx
// Creating a new component that duplicates functionality
export function FormattedDate({ date, variant }) {
  // Implementation that duplicates existing functionality
  return <span>{/* formatted date */}</span>
}
```

Good:
```tsx
// Using an existing component with appropriate parameters
import { DateTime } from "./DateTime"

// In your render function
<DateTime date={date} variant={variant} noTrigger={true} />
```

Avoid duplicating code in TypeScript. Extract repeated logic into reusable functions, types, or constants. You may have to search the codebase to see if the method or type is already defined.

Bad:

```typescript
// Duplicated type definitions
interface User {
  id: string
  name: string
}

interface UserProfile {
  id: string
  name: string
}

// Magic numbers repeated
const pageSize = 10
const itemsPerPage = 10
```

Good:

```typescript
// Reusable type and constant
type User = {
  id: string
  name: string
}

const PAGE_SIZE = 10
```