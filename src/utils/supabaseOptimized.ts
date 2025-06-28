import { supabase } from '../lib/supabase';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// Query optimization utilities
export interface QueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending?: boolean };
  cache?: boolean;
  cacheTTL?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum cache entries

  private generateKey(table: string, options: QueryOptions, filters?: any): string {
    return `${table}:${JSON.stringify({ options, filters })}`;
  }

  get<T>(table: string, options: QueryOptions, filters?: any): T | null {
    const key = this.generateKey(table, options, filters);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(table: string, options: QueryOptions, filters: any, data: T): void {
    const key = this.generateKey(table, options, filters);
    const ttl = options.cacheTTL || 5 * 60 * 1000; // Default 5 minutes
    
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(): void {
    this.cache.clear();
  }

  clearTable(table: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${table}:`)) {
        this.cache.delete(key);
      }
    }
  }
}

const queryCache = new QueryCache();

// Optimized query builder
export class OptimizedQueryBuilder<T> {
  private table: string;
  private selectFields: string = '*';
  private filters: any[] = [];
  private orderByClause?: { column: string; ascending: boolean };
  private limitValue?: number;
  private offsetValue?: number;
  private cacheEnabled = false;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes default

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string): OptimizedQueryBuilder<T> {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any): OptimizedQueryBuilder<T> {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: any): OptimizedQueryBuilder<T> {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  in(column: string, values: any[]): OptimizedQueryBuilder<T> {
    this.filters.push({ type: 'in', column, values });
    return this;
  }

  gte(column: string, value: any): OptimizedQueryBuilder<T> {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lte(column: string, value: any): OptimizedQueryBuilder<T> {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  like(column: string, pattern: string): OptimizedQueryBuilder<T> {
    this.filters.push({ type: 'like', column, pattern });
    return this;
  }

  ilike(column: string, pattern: string): OptimizedQueryBuilder<T> {
    this.filters.push({ type: 'ilike', column, pattern });
    return this;
  }

  orderBy(column: string, ascending = true): OptimizedQueryBuilder<T> {
    this.orderByClause = { column, ascending };
    return this;
  }

  limit(count: number): OptimizedQueryBuilder<T> {
    this.limitValue = count;
    return this;
  }

  offset(count: number): OptimizedQueryBuilder<T> {
    this.offsetValue = count;
    return this;
  }

  cache(ttl = 5 * 60 * 1000): OptimizedQueryBuilder<T> {
    this.cacheEnabled = true;
    this.cacheTTL = ttl;
    return this;
  }

  private applyFilters(query: PostgrestFilterBuilder<any, any, any>): PostgrestFilterBuilder<any, any, any> {
    let filteredQuery = query;

    for (const filter of this.filters) {
      switch (filter.type) {
        case 'eq':
          filteredQuery = filteredQuery.eq(filter.column, filter.value);
          break;
        case 'neq':
          filteredQuery = filteredQuery.neq(filter.column, filter.value);
          break;
        case 'in':
          filteredQuery = filteredQuery.in(filter.column, filter.values);
          break;
        case 'gte':
          filteredQuery = filteredQuery.gte(filter.column, filter.value);
          break;
        case 'lte':
          filteredQuery = filteredQuery.lte(filter.column, filter.value);
          break;
        case 'like':
          filteredQuery = filteredQuery.like(filter.column, filter.pattern);
          break;
        case 'ilike':
          filteredQuery = filteredQuery.ilike(filter.column, filter.pattern);
          break;
      }
    }

    return filteredQuery;
  }

  async execute(): Promise<{ data: T[] | null; error: any; count?: number }> {
    // Check cache first
    if (this.cacheEnabled) {
      const cached = queryCache.get<T[]>(this.table, {
        select: this.selectFields,
        limit: this.limitValue,
        offset: this.offsetValue,
        orderBy: this.orderByClause,
        cache: true,
        cacheTTL: this.cacheTTL
      }, this.filters);

      if (cached) {
        return { data: cached, error: null };
      }
    }

    // Build and execute query
    let query = supabase.from(this.table).select(this.selectFields, { count: 'exact' });
    
    // Apply filters
    query = this.applyFilters(query);

    // Apply ordering
    if (this.orderByClause) {
      query = query.order(this.orderByClause.column, { ascending: this.orderByClause.ascending });
    }

    // Apply pagination
    if (this.limitValue !== undefined) {
      query = query.limit(this.limitValue);
    }
    if (this.offsetValue !== undefined) {
      query = query.range(this.offsetValue, this.offsetValue + (this.limitValue || 1000) - 1);
    }

    const result = await query;

    // Cache successful results
    if (this.cacheEnabled && !result.error && result.data) {
      queryCache.set(this.table, {
        select: this.selectFields,
        limit: this.limitValue,
        offset: this.offsetValue,
        orderBy: this.orderByClause,
        cache: true,
        cacheTTL: this.cacheTTL
      }, this.filters, result.data);
    }

    return result;
  }

  async single(): Promise<{ data: T | null; error: any }> {
    this.limitValue = 1;
    const result = await this.execute();
    return {
      data: result.data?.[0] || null,
      error: result.error
    };
  }
}

// Factory function for creating optimized queries
export function createOptimizedQuery<T>(table: string): OptimizedQueryBuilder<T> {
  return new OptimizedQueryBuilder<T>(table);
}

// Optimized data fetchers for common patterns
export class OptimizedDataService {
  // Get user's company with caching
  static async getUserCompany(userId: string) {
    return createOptimizedQuery<any>('companies')
      .select('*')
      .eq('user_id', userId)
      .cache(10 * 60 * 1000) // Cache for 10 minutes
      .single();
  }

  // Get jobs with candidate count (optimized join)
  static async getJobsWithCandidateCount(companyId: string) {
    return createOptimizedQuery<any>('jobs')
      .select(`
        *,
        candidates(count)
      `)
      .eq('company_id', companyId)
      .orderBy('created_at', false)
      .cache(2 * 60 * 1000) // Cache for 2 minutes
      .execute();
  }

  // Get candidates with job info (optimized join)
  static async getCandidatesWithJobs(jobIds: string[]) {
    return createOptimizedQuery<any>('candidates')
      .select(`
        *,
        job:jobs(id, title, company_id)
      `)
      .in('job_id', jobIds)
      .orderBy('created_at', false)
      .cache(1 * 60 * 1000) // Cache for 1 minute
      .execute();
  }

  // Get reports with candidate and job info (optimized join)
  static async getReportsWithDetails(candidateIds: string[]) {
    return createOptimizedQuery<any>('interview_reports')
      .select(`
        *,
        candidate:candidates(
          *,
          job:jobs(*)
        )
      `)
      .in('candidate_id', candidateIds)
      .orderBy('created_at', false)
      .cache(5 * 60 * 1000) // Cache for 5 minutes
      .execute();
  }

  // Get subscription with plan details
  static async getActiveSubscription(companyId: string) {
    return createOptimizedQuery<any>('subscriptions')
      .select(`
        *,
        plan:plans(*)
      `)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .cache(15 * 60 * 1000) // Cache for 15 minutes
      .single();
  }

  // Paginated query with search
  static async searchWithPagination<T>(
    table: string,
    searchTerm: string,
    searchColumns: string[],
    page: number = 1,
    pageSize: number = 20,
    additionalFilters: any[] = []
  ) {
    const offset = (page - 1) * pageSize;
    
    let query = createOptimizedQuery<T>(table)
      .select('*')
      .limit(pageSize)
      .offset(offset);

    // Apply search filters
    if (searchTerm && searchColumns.length > 0) {
      // For multiple columns, we'll use ilike on each
      // Note: This is a simplified approach. For better performance,
      // consider using full-text search or a search service
      for (const column of searchColumns) {
        query = query.ilike(column, `%${searchTerm}%`);
      }
    }

    // Apply additional filters
    for (const filter of additionalFilters) {
      switch (filter.type) {
        case 'eq':
          query = query.eq(filter.column, filter.value);
          break;
        case 'in':
          query = query.in(filter.column, filter.values);
          break;
        // Add more filter types as needed
      }
    }

    return query.execute();
  }

  // Batch operations for better performance
  static async batchInsert<T>(table: string, records: T[]) {
    // Split into chunks to avoid hitting size limits
    const chunkSize = 100;
    const chunks = [];
    
    for (let i = 0; i < records.length; i += chunkSize) {
      chunks.push(records.slice(i, i + chunkSize));
    }

    const results = [];
    for (const chunk of chunks) {
      const result = await supabase.from(table).insert(chunk);
      results.push(result);
      
      if (result.error) {
        console.error(`Batch insert error for ${table}:`, result.error);
        break;
      }
    }

    // Clear cache for this table after insert
    queryCache.clearTable(table);
    
    return results;
  }

  // Batch update
  static async batchUpdate<T>(table: string, updates: Array<{ id: string; data: Partial<T> }>) {
    const results = [];
    
    for (const update of updates) {
      const result = await supabase
        .from(table)
        .update(update.data)
        .eq('id', update.id);
      
      results.push(result);
      
      if (result.error) {
        console.error(`Batch update error for ${table}:`, result.error);
        break;
      }
    }

    // Clear cache for this table after update
    queryCache.clearTable(table);
    
    return results;
  }
}

// Cache management utilities
export const cacheManager = {
  clear: () => queryCache.clear(),
  clearTable: (table: string) => queryCache.clearTable(table),
  
  // Invalidate cache when data changes
  invalidateOnMutation: (table: string) => {
    queryCache.clearTable(table);
    
    // Also clear related tables
    const relatedTables: Record<string, string[]> = {
      'companies': ['jobs', 'candidates', 'subscriptions'],
      'jobs': ['candidates', 'interview_reports'],
      'candidates': ['interview_reports'],
      'plans': ['subscriptions']
    };
    
    if (relatedTables[table]) {
      relatedTables[table].forEach(relatedTable => {
        queryCache.clearTable(relatedTable);
      });
    }
  }
};