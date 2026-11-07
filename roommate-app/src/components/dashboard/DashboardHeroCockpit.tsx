import {
  Home,
  Calendar,
  Wallet,
  ClipboardList,
  Utensils,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Loader2,
  Clock,
  Users,
  Megaphone,
  MessageSquare,
} from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { useAddLowStockToCartMutation } from '@/hooks/queries/useShoppingCartQueries';
import {
  useKitchenTableQuery,
  useAcknowledgeNoticeMutation,
} from '@/hooks/queries/useHouseholdQueries';
import { getCurrentUserId } from '@/utils/jwt';
import type { InventoryItem } from '@/types/inventoryTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardHeroCockpitProps {
  netBalance?: number;
  urgentChoreName?: string;
  urgentChoreDueText?: string;
  lowStockItems?: InventoryItem[];
  peerDebtName?: string;
  peerDebtAmount?: number;
  peerDebtDescription?: string;
  isUserDebtor?: boolean;
  onOpenSettleModal?: () => void;
}

export function DashboardHeroCockpit({
  netBalance = 0,
  urgentChoreName,
  urgentChoreDueText,
  lowStockItems = [],
  peerDebtName = '',
  peerDebtAmount = 0,
  peerDebtDescription = 'Household Split',
  isUserDebtor = true,
  onOpenSettleModal,
}: DashboardHeroCockpitProps) {
  const { activeHousehold, activeHouseholdId, hasActiveHousehold } = useHousehold();
  const currentUserId = getCurrentUserId();
  const addLowStockMutation = useAddLowStockToCartMutation();
  const acknowledgeNoticeMutation = useAcknowledgeNoticeMutation();
  const { data: kitchenTable } = useKitchenTableQuery(activeHouseholdId);

  const activeMode = kitchenTable?.activeMode || (kitchenTable?.dishName ? 'CHEF' : null);
  const activeMeal = kitchenTable?.meal || (kitchenTable?.dishName ? kitchenTable : null);
  const activeNotice = kitchenTable?.notice;
  const activeQna = kitchenTable?.qna;

  // Mode A: CHEF
  const hasActiveDinner = !!activeMeal && activeMeal.status === 'ACTIVE';
  const attendingRsvps = activeMeal?.rsvps?.filter((r) => r.attending) || [];
  const currentUserRsvp = activeMeal?.rsvps?.find((r) => r.userId === currentUserId);
  const isUserAttending = currentUserRsvp ? currentUserRsvp.attending : false;
  const isUserChef = hasActiveDinner && activeMeal.chefId === currentUserId;
  const extraPlatesCount = typeof activeMeal?.extraPlates === 'number' ? activeMeal.extraPlates : 0;

  // Mode B: NOTICE
  const hasActiveNotice = !!activeNotice;
  const noticeAcks = activeNotice?.acknowledgments || [];
  const isUserAcked = noticeAcks.some((a) => a.userId === currentUserId);

  // Mode C: QNA
  const hasActiveQna = !!activeQna;
  const qnaReplies = activeQna?.replies || [];
  const isUserReplied = qnaReplies.some((r) => r.userId === currentUserId);
  const latestReply = qnaReplies.length > 0 ? qnaReplies[qnaReplies.length - 1] : null;

  const handleAcknowledge = () => {
    if (!activeHouseholdId) return;
    acknowledgeNoticeMutation.mutate({ householdId: activeHouseholdId });
  };

  const householdDisplayName =
    hasActiveHousehold && activeHousehold?.name
      ? activeHousehold.settings?.unitOrApt
        ? `${activeHousehold.name} • ${activeHousehold.settings.unitOrApt}`
        : activeHousehold.name
      : 'NorthWing #4B';

  const isNetPositive = netBalance >= 0;
  const formattedBalance = `${isNetPositive ? '+' : '-'}$${Math.abs(netBalance).toFixed(2)}`;

  const handleAutoAddToCart = () => {
    if (!activeHouseholdId || lowStockItems.length === 0) return;
    addLowStockMutation.mutate(activeHouseholdId);
  };

  const handleScrollToDuty = () => {
    const el =
      document.getElementById('duty-card-urgent') || document.getElementById('dutyCardSourav');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Critical low stock items label
  const lowCount = lowStockItems.length;
  const lowSummary =
    lowCount > 0 ? (
      <>
        {lowStockItems.slice(0, 2).map((item, idx) => (
          <span key={item.inventoryItemId || item.name || idx}>
            {idx > 0 && ', '}
            <strong className="text-white font-medium">{item.name}</strong> ({item.quantity}
            {item.unit || ''} left)
          </span>
        ))}
      </>
    ) : (
      'All pantry essentials well stocked'
    );

  const hasPeerDebt = peerDebtAmount > 0 && !!peerDebtName;

  // Auto-draft calculation from household budget settings
  const autoDraftAmount = activeHousehold?.settings?.monthlyCommunalBudget
    ? Math.round(activeHousehold.settings.monthlyCommunalBudget / 4)
    : 800;

  return (
    <Card
      aria-label="Dominant Glanceable Hero Region"
      className="w-full bg-cockpit-gradient text-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-white/10 shadow-md flex flex-col gap-3.5 select-none relative overflow-hidden"
    >
      {/* Ambient background glow mapped to active theme's primary color */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* TOP CONTEXT BAR */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center text-primary-fixed shrink-0">
            <Home className="w-4 h-4 text-primary-fixed" />
          </div>
          <h1 className="font-bold text-lg sm:text-[20px] text-white tracking-tight font-sans">
            Today at {householdDisplayName}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/80 bg-black/30 border border-white/10 px-2.5 py-1 rounded-lg shrink-0">
          <Calendar className="w-3.5 h-3.5 text-primary-fixed" />
          <span>Auto-draft: Nov 1 (${autoDraftAmount}) Chase</span>
        </div>
      </div>

      {/* VITALS GRID (UNIFIED 3-PART GRID) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* VITAL 1: FINANCIAL BALANCE */}
        <Card className="bg-white/5 border border-white/10 rounded-xl shadow-none">
          <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between gap-3 h-full min-h-[175px]">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/65 flex items-center gap-1.5 font-sans">
                  <Wallet className="w-3.5 h-3.5 text-primary-fixed" />
                  Your Balance
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-sans ${
                    isNetPositive
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/20'
                      : 'bg-destructive/20 text-destructive border-destructive/30'
                  }`}
                >
                  {isNetPositive ? 'In Credit' : 'You Owe'}
                </Badge>
              </div>
              <div
                className={`font-mono font-bold text-2xl sm:text-[26px] tracking-tight leading-none pt-0.5 tabular-nums ${
                  isNetPositive ? 'text-emerald-400' : 'text-primary-fixed-dim'
                }`}
              >
                {formattedBalance}
              </div>
              <p className="text-[11px] text-white/85 font-medium leading-snug">
                {hasPeerDebt ? (
                  isUserDebtor ? (
                    <>
                      Owe {peerDebtName}{' '}
                      <strong className="text-primary-fixed-dim font-semibold tabular-nums">
                        ${peerDebtAmount.toFixed(2)}
                      </strong>{' '}
                      · {peerDebtDescription}
                    </>
                  ) : (
                    <>
                      {peerDebtName} owes you{' '}
                      <strong className="text-emerald-300 font-semibold tabular-nums">
                        ${peerDebtAmount.toFixed(2)}
                      </strong>{' '}
                      · {peerDebtDescription}
                    </>
                  )
                ) : (
                  'All settled up · No outstanding debts'
                )}
              </p>
            </div>

            <Button
              type="button"
              onClick={hasPeerDebt && isUserDebtor ? onOpenSettleModal : undefined}
              disabled={!hasPeerDebt || !isUserDebtor}
              className="w-full min-h-[40px] py-2 px-3 rounded-lg bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold text-xs tracking-tight transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border-b-2 border-primary-fixed-dim disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>
                {hasPeerDebt
                  ? isUserDebtor
                    ? `Settle $${peerDebtAmount.toFixed(2)} with ${peerDebtName}`
                    : `${peerDebtName} Owes $${peerDebtAmount.toFixed(2)}`
                  : 'All Settled Up ✨'}
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* VITAL 2: COMMUNAL DUTY */}
        <Card className="bg-white/5 border border-white/10 rounded-xl shadow-none">
          <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between gap-3 h-full min-h-[175px]">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/65 flex items-center gap-1.5 font-sans">
                  <ClipboardList className="w-3.5 h-3.5 text-primary-fixed-dim" />
                  Communal Duty
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-sans ${
                    urgentChoreName
                      ? 'bg-primary/20 text-primary-fixed-dim border-primary/40 animate-pulse'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/20'
                  }`}
                >
                  {urgentChoreName ? 'Urgent' : 'All Clean'}
                </Badge>
              </div>
              <h2 className="font-bold text-[13px] text-white leading-tight tracking-tight pt-0.5 font-sans line-clamp-1">
                {urgentChoreName || 'Wipe Kitchen Quartz & Degrease Stove'}
              </h2>
              <p className="text-[11px] text-white/85 flex items-center gap-1 leading-snug font-medium font-sans">
                <Clock className="w-3.5 h-3.5 text-primary-fixed-dim shrink-0" />
                <span>
                  {urgentChoreDueText ||
                    (urgentChoreName ? 'Due 7:00 PM · Main Kitchen' : 'No pending duties')}
                </span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleScrollToDuty}
              className="w-full min-h-[40px] py-2 px-3 rounded-lg bg-black/40 hover:bg-black/60 hover:text-white border border-white/10 active:scale-95 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-fixed" />
              <span>{urgentChoreName ? 'View & Stamp Duty' : 'View Duty Rotation'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* VITAL 3: DYNAMIC COMMONS & FRIDGE BOARD (Chef / Notice / Q&A) */}
        <Card className="bg-white/5 border border-white/10 rounded-xl shadow-none">
          <CardContent className="p-3.5 sm:p-4 flex flex-col justify-between gap-3 h-full min-h-[175px]">
            {activeMode === 'NOTICE' && hasActiveNotice ? (
              /* STATE: NOTICE BOARD */
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-white/65 flex items-center gap-1.5 font-sans">
                      <Megaphone className="w-3.5 h-3.5 text-amber-400" />
                      House Notice
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-sans ${
                        activeNotice.urgency === 'URGENT'
                          ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                          : activeNotice.urgency === 'MAINTENANCE'
                            ? 'bg-blue-950/70 text-blue-300 border-blue-500/40'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {activeNotice.urgency === 'URGENT'
                        ? 'Urgent ⚠️'
                        : activeNotice.urgency === 'MAINTENANCE'
                          ? 'Maintenance 🔧'
                          : 'Notice 📢'}
                    </Badge>
                  </div>
                  <h2 className="font-bold text-[13px] text-white leading-tight tracking-tight pt-0.5 font-sans line-clamp-1">
                    {activeNotice.title}
                  </h2>
                  <p className="text-[11px] text-white/85 font-medium leading-snug flex items-center gap-1 font-sans">
                    <Clock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                    <span>
                      Posted by {activeNotice.authorName} · {noticeAcks.length} Acknowledged
                    </span>
                  </p>
                </div>

                <div className="w-full py-2 px-3 rounded-lg bg-black/25 border border-white/10 flex items-center justify-between text-[11px] text-white/85 min-h-[38px]">
                  <span className="truncate font-medium font-sans">
                    House Bulletin ({activeNotice.urgency.toLowerCase()})
                  </span>
                  {isUserAcked ? (
                    <span className="text-emerald-400 font-semibold tracking-wide uppercase text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded shrink-0 border border-emerald-500/30 font-sans flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Seen ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAcknowledge}
                      disabled={acknowledgeNoticeMutation.isPending}
                      className="text-amber-300 hover:text-white font-semibold tracking-wide uppercase text-[10px] bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-0.5 rounded shrink-0 border border-amber-500/30 transition-colors cursor-pointer font-sans"
                    >
                      {acknowledgeNoticeMutation.isPending ? 'Marking...' : 'Acknowledge'}
                    </button>
                  )}
                </div>
              </>
            ) : activeMode === 'QNA' && hasActiveQna ? (
              /* STATE: Q&A BOARD */
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-white/65 flex items-center gap-1.5 font-sans">
                      <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                      Flatmate Q&A
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border-sky-500/30 font-sans"
                    >
                      {isUserReplied ? 'Answered 💬' : 'Open Query ❓'}
                    </Badge>
                  </div>
                  <h2 className="font-bold text-[13px] text-white leading-tight tracking-tight pt-0.5 font-sans line-clamp-1">
                    {activeQna.question}
                  </h2>
                  <p className="text-[11px] text-white/85 font-medium leading-snug flex items-center gap-1 font-sans">
                    <Users className="w-3.5 h-3.5 text-sky-400/80 shrink-0" />
                    <span>
                      Asked by {activeQna.authorName} · {qnaReplies.length} Answer
                      {qnaReplies.length === 1 ? '' : 's'}
                    </span>
                  </p>
                </div>

                <div className="w-full py-2 px-3 rounded-lg bg-black/25 border border-white/10 flex items-center justify-between text-[11px] text-white/85 min-h-[38px]">
                  <span className="truncate font-medium font-sans">
                    {latestReply ? `"${latestReply.text}"` : 'Discussion open below'}
                  </span>
                  <span className="text-sky-300 font-semibold tracking-wide uppercase text-[10px] bg-white/5 px-2 py-0.5 rounded shrink-0 border border-white/10 font-sans">
                    {qnaReplies.length > 0 ? `${qnaReplies.length} replies` : 'Open'}
                  </span>
                </div>
              </>
            ) : (
              /* STATE: CHEF MODE (Or Default) */
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-white/65 flex items-center gap-1.5 font-sans">
                      <Utensils className="w-3.5 h-3.5 text-primary-fixed" />
                      Dinner RSVP
                    </span>
                    {hasActiveDinner ? (
                      isUserChef ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary-fixed border-primary/30 font-sans"
                        >
                          Chef ♨️
                        </Badge>
                      ) : isUserAttending ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border-emerald-500/20 font-sans"
                        >
                          Going ✨
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/80 border-white/20 font-sans"
                        >
                          Open RSVP
                        </Badge>
                      )
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/60 border-white/10 font-sans"
                      >
                        Open
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-bold text-[13px] text-white leading-tight tracking-tight pt-0.5 font-sans line-clamp-1">
                    {hasActiveDinner ? activeMeal.dishName : 'No Dinner Planned Today'}
                  </h2>
                  <p className="text-[11px] text-white/85 font-medium leading-snug flex items-center gap-1 font-sans">
                    <Users className="w-3.5 h-3.5 text-primary-fixed shrink-0" />
                    <span>
                      {hasActiveDinner
                        ? `Tonight ${activeMeal.servingTime} · ${attendingRsvps.length} RSVP'd`
                        : 'Chef table open for grabs'}
                    </span>
                  </p>
                </div>

                <div className="w-full py-2 px-3 rounded-lg bg-black/25 border border-white/10 flex items-center justify-between text-[11px] text-white/85 min-h-[38px]">
                  <span className="truncate font-medium font-sans">
                    {hasActiveDinner
                      ? `Chef: ${activeMeal.chefName}${
                          extraPlatesCount > 0 ? ` (${extraPlatesCount} extra portions)` : ''
                        }`
                      : 'Broadcast tonight’s meal'}
                  </span>
                  <span className="text-primary-fixed font-semibold tracking-wide uppercase text-[10px] bg-white/5 px-2 py-0.5 rounded shrink-0 border border-white/10 font-sans">
                    {hasActiveDinner
                      ? isUserAttending || isUserChef
                        ? 'Confirmed'
                        : 'RSVP Open'
                      : 'Open'}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* STREAMLINED ATTACHED LOW-STOCK FOOTER */}
      <div className="relative z-10 bg-black/25 border border-white/10 rounded-xl px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0 text-white/85">
          {lowCount > 0 ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="truncate text-white/90 font-sans">
            {lowCount > 0 ? (
              <>
                <span className="font-medium">
                  {lowCount} Critical Low{lowCount > 1 ? 's' : ''}:
                </span>{' '}
                {lowSummary}
              </>
            ) : (
              'All pantry essentials well stocked'
            )}
          </span>
        </div>
        <Button
          type="button"
          onClick={handleAutoAddToCart}
          disabled={addLowStockMutation.isPending || lowCount === 0}
          className="min-h-[36px] px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold tracking-wide uppercase transition-all shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer disabled:opacity-50"
        >
          {addLowStockMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShoppingCart className="w-3.5 h-3.5" />
          )}
          <span>{lowCount > 0 ? `Auto-Add to Cart (${lowCount})` : 'Pantry Stocked'}</span>
        </Button>
      </div>
    </Card>
  );
}

export default DashboardHeroCockpit;
