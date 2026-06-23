import { z } from "zod";
import { OrganizationTypeSchema, type OrganizationType } from "./organization-schema";

export type { OrganizationType };

export const organizationSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: OrganizationTypeSchema,
});
export type Organization = z.infer<typeof organizationSchema>;

/** A single organization node as returned (flat) by the organizations endpoint. */
export const organizationNodeSchema = z.object({
    id: z.number(),
    parent_id: z.number().nullable(),
    name: z.string(),
    type: OrganizationTypeSchema,
    code: z.string().nullable().optional(),
    path: z.string().optional(),
});

export type OrganizationNode = z.infer<typeof organizationNodeSchema>;

export const organizationListSchema = z.array(organizationNodeSchema);

export interface OrganizationTreeNode {
    id: string;
    name: string;
    type: OrganizationType;
    code?: string;
    children?: OrganizationTreeNode[];
}

