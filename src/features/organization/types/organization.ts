export interface OrgNode {
    id: number;
    holding_id: number;             // The root multi-tenant link
    parent_id: number | null;        // Null only for the root 'holding' node
    
    name: string;                    // e.g., "شعبه پاسداران" or "کیا گلد"
    code?: string;                   // Optional code for finance mapping (e.g., "PAS-01")
    type: OrgNodeType;               // Using the enum type above
    path: string;                    // Materialized path for fast lookups, e.g., "1/5/12"
    
    // Recursive UI structure
    children?: OrgNode[];            // Note: properly spelled 'children' instead of 'childrens'
    
    // Depth-specific metadata (Optional context fields)
    metadata?: {
      currency?: 'IRR' | 'AED';       // Useful if node is a branch/unit in Dubai vs Tehran
      address?: string;
      phone?: string;
    };
    
    created_at?: string;
    updated_at?: string;
  }

export type OrgNodeType = "holding" | "brand" | "region" | "city" | "branch" | "unit";