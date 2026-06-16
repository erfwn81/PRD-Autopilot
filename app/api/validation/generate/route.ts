import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createClient } from '@/lib/supabase/server';
import { marketAgent } from '@/lib/agents/validation/marketAgent';
import { competitorAgent } from '@/lib/agents/validation/competitorAgent';
import { customerAgent } from '@/lib/agents/validation/customerAgent';
import { riskAgent } from '@/lib/agents/validation/riskAgent';
import { swotAgent } from '@/lib/agents/validation/swotAgent';
import { verdictAgent } from '@/lib/agents/validation/verdictAgent';

async function tryAgent<T>(fn: () => Promise<T>): Promise<T | { error: true }> {
  try {
    return await fn();
  } catch {
    try {
      return await fn();
    } catch {
      return { error: true } as { error: true };
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAuth = createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const idea = (body.idea as string | undefined)?.trim() ?? '';

    if (!idea) {
      return NextResponse.json({ error: 'idea is required' }, { status: 400 });
    }
    if (idea.length > 1000) {
      return NextResponse.json({ error: 'idea must be 1000 characters or fewer' }, { status: 400 });
    }

    // Batch 1: market, competitors, customer in parallel
    const [marketResult, competitorResult, customerResult] = await Promise.all([
      tryAgent(() => marketAgent(idea)),
      tryAgent(() => competitorAgent(idea)),
      tryAgent(() => customerAgent(idea)),
    ]);

    // Batch 2: risks, swot in parallel
    const [riskResult, swotResult] = await Promise.all([
      tryAgent(() => riskAgent(idea)),
      tryAgent(() => swotAgent(idea)),
    ]);

    // Collect sources from search-enabled agents
    const allSources: string[] = [];
    if (marketResult && !('error' in marketResult)) {
      allSources.push(...marketResult.sources);
    }
    if (competitorResult && !('error' in competitorResult)) {
      allSources.push(...competitorResult.sources);
    }
    const seen = new Set<string>();
    const sources = allSources.filter(u => { if (seen.has(u)) return false; seen.add(u); return true; });

    // Batch 3: verdict with all prior context
    const verdictContext = {
      market: 'error' in marketResult ? marketResult : marketResult.data,
      competitors: 'error' in competitorResult ? competitorResult : competitorResult.data,
      customer: customerResult,
      risks: riskResult,
      swot: swotResult,
    };

    const verdictResult = await tryAgent(() => verdictAgent(idea, verdictContext));

    const marketData = 'error' in marketResult ? marketResult : marketResult.data;
    const competitorData = 'error' in competitorResult ? competitorResult : competitorResult.data;

    const supabase = createServiceClient();
    const { data: saved, error: saveError } = await supabase
      .from('validation_reports')
      .insert({
        user_id: user.id,
        idea_input: idea,
        market_size: marketData,
        competitors: competitorData,
        target_customer: customerResult,
        risks: riskResult,
        swot: swotResult,
        verdict: verdictResult,
        sources,
      })
      .select()
      .single();

    if (saveError || !saved) {
      console.error('validation_reports insert error:', saveError);
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }

    return NextResponse.json({
      report_id: saved.id,
      report: saved,
    });
  } catch (err) {
    console.error('/api/validation/generate error:', err);
    return NextResponse.json({ error: 'Validation generation failed' }, { status: 500 });
  }
}
