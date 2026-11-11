import { useState, useEffect, useRef } from 'react';
import {
  UtensilsCrossed,
  Radio,
  Plus,
  Minus,
  Check,
  ChevronDown,
  Loader2,
  Megaphone,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import { getCurrentUserId } from '@/utils/jwt';
import {
  useKitchenTableQuery,
  useBroadcastKitchenTableMutation,
  useToggleKitchenTableRsvpMutation,
  useAcknowledgeNoticeMutation,
  useReplyQnaMutation,
} from '@/hooks/queries/useHouseholdQueries';
import type { KitchenTableMode } from '@/types/householdTypes';

const QUICK_DISH_CHIPS = ['Thai Curry', '+ Sourdough', '+ Veggie Stirfry', '+ Pasta'];
const SERVING_TIMES = ['7:30', '8:00', '8:30'];

const QUICK_QNA_CHIPS = ['+ Borrow Item', '+ Lost & Found', '+ Quick Poll', '+ Weekend Plans'];

const NOTICE_URGENCIES: Array<{
  id: 'URGENT' | 'MAINTENANCE' | 'GENERAL' | 'SOCIAL';
  label: string;
  icon: string;
}> = [
  { id: 'URGENT', label: 'Urgent', icon: '⚠️' },
  { id: 'MAINTENANCE', label: 'Maintenance', icon: '🔧' },
  { id: 'GENERAL', label: 'Info', icon: 'ℹ️' },
  { id: 'SOCIAL', label: 'Social', icon: '🎉' },
];

const BOARD_MODES: Array<{
  id: KitchenTableMode;
  label: string;
  subtitle: string;
  icon: string;
  badgeClass: string;
}> = [
  {
    id: 'CHEF',
    label: 'Chef Mode',
    subtitle: "Tonight's dish & extras",
    icon: '♨️',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'QNA',
    label: 'Q&A Mode',
    subtitle: 'Flatmate questions & forum',
    icon: '💬',
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  },
  {
    id: 'NOTICE',
    label: 'Notice Mode',
    subtitle: 'House bulletin announcements',
    icon: '📢',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
];

export function KitchenTableCard() {
  const { activeHouseholdId } = useHousehold();
  const { userId: authUserId } = useAuth();
  const userId = authUserId || getCurrentUserId();

  const { data: kitchenTable } = useKitchenTableQuery(activeHouseholdId);
  const broadcastMutation = useBroadcastKitchenTableMutation();
  const rsvpMutation = useToggleKitchenTableRsvpMutation();
  const ackNoticeMutation = useAcknowledgeNoticeMutation();
  const replyQnaMutation = useReplyQnaMutation();

  // Dropdown & Active Mode State
  const [activeMode, setActiveMode] = useState<KitchenTableMode>('CHEF');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Chef Form State
  const [dishName, setDishName] = useState('Thai Curry with Jasmine Rice');
  const [servingTime, setServingTime] = useState('8:00 PM');
  const [extraPlates, setExtraPlates] = useState(3);

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState('Landlord AC Inspection at 2:00 PM');
  const [noticeUrgency, setNoticeUrgency] = useState<
    'URGENT' | 'MAINTENANCE' | 'GENERAL' | 'SOCIAL'
  >('URGENT');

  // Q&A Form State
  const [questionText, setQuestionText] = useState('Anyone have a spare HDMI cable I can borrow?');
  const [qnaCategory, setQnaCategory] = useState('Borrow Item');
  const [replyInputText, setReplyInputText] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state when kitchenTable loads
  useEffect(() => {
    if (kitchenTable?.activeMode) {
      setActiveMode(kitchenTable.activeMode);
    }
    if (kitchenTable?.meal?.dishName) {
      setDishName(kitchenTable.meal.dishName);
    }
    if (kitchenTable?.meal?.servingTime) {
      setServingTime(kitchenTable.meal.servingTime);
    }
    if (typeof kitchenTable?.meal?.extraPlates === 'number') {
      setExtraPlates(kitchenTable.meal.extraPlates);
    }
  }, [kitchenTable]);

  // Active items
  const activeMeal = kitchenTable?.meal || (kitchenTable?.dishName ? kitchenTable : null);
  const activeNotice = kitchenTable?.notice;
  const activeQna = kitchenTable?.qna;

  const attendingRsvps = activeMeal?.rsvps?.filter((rsvp: any) => rsvp.attending) || [];
  const currentUserRsvp = activeMeal?.rsvps?.find((rsvp: any) => rsvp.userId === userId);
  const isAttending = currentUserRsvp ? currentUserRsvp.attending : false;
  const isChef = activeMeal?.chefId === userId;

  const noticeAcks = activeNotice?.acknowledgments || [];
  const isUserAcked = noticeAcks.some((a: any) => a.userId === userId);

  const qnaReplies = activeQna?.replies || [];

  // Handlers
  const handleChipClick = (chip: string) => {
    const cleanChip = chip.replace(/^\+\s*/, '');
    if (!dishName.trim()) {
      setDishName(cleanChip);
    } else if (!dishName.toLowerCase().includes(cleanChip.toLowerCase())) {
      setDishName(`${dishName} & ${cleanChip}`);
    }
  };

  const handleQnaChipClick = (chip: string) => {
    const clean = chip.replace(/^\+\s*/, '');
    setQnaCategory(clean);
    if (!questionText.trim()) {
      setQuestionText(`${clean}: `);
    }
  };

  const handleBroadcastChef = () => {
    if (!activeHouseholdId || !dishName.trim()) {
      toast.error('Please enter a dish name');
      return;
    }
    broadcastMutation.mutate({
      householdId: activeHouseholdId,
      dto: {
        mode: 'CHEF',
        payload: {
          dishName: dishName.trim(),
          servingTime,
          extraPlates,
        },
      },
    });
  };

  const handleBroadcastNotice = () => {
    if (!activeHouseholdId || !noticeTitle.trim()) {
      toast.error('Please enter an announcement title');
      return;
    }
    broadcastMutation.mutate({
      householdId: activeHouseholdId,
      dto: {
        mode: 'NOTICE',
        payload: {
          title: noticeTitle.trim(),
          urgency: noticeUrgency,
        },
      },
    });
  };

  const handleBroadcastQna = () => {
    if (!activeHouseholdId || !questionText.trim()) {
      toast.error('Please enter a question');
      return;
    }
    broadcastMutation.mutate({
      householdId: activeHouseholdId,
      dto: {
        mode: 'QNA',
        payload: {
          question: questionText.trim(),
          category: qnaCategory,
        },
      },
    });
  };

  const handleToggleRsvp = () => {
    if (!activeHouseholdId) return;
    rsvpMutation.mutate({
      householdId: activeHouseholdId,
      dto: {
        attending: !isAttending,
        note: !isAttending ? 'Attending' : "Can't make it",
      },
    });
  };

  const handleAcknowledgeNotice = () => {
    if (!activeHouseholdId) return;
    ackNoticeMutation.mutate({ householdId: activeHouseholdId });
  };

  const handleSendReply = () => {
    if (!activeHouseholdId || !replyInputText.trim()) return;
    replyQnaMutation.mutate(
      {
        householdId: activeHouseholdId,
        text: replyInputText.trim(),
      },
      {
        onSuccess: () => setReplyInputText(''),
      }
    );
  };

  const currentModeConfig = BOARD_MODES.find((m) => m.id === activeMode) || BOARD_MODES[0];

  return (
    <Card
      aria-label="Commons & Kitchen Table Coordination"
      className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-3.5 select-none relative"
    >
      {/* Header */}
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-border/60 pb-3 space-y-0 relative">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-4 h-4 stroke-[2.2]" />
          </div>
          <CardTitle className="text-sm sm:text-base font-bold tracking-wider uppercase text-foreground font-mono">
            Tonight's Kitchen Table
          </CardTitle>
        </div>

        {/* 3-Mode Dropdown Switcher */}
        <div className="relative" ref={dropdownRef}>
          <Button
            id="kitchen-table-mode-toggle"
            type="button"
            variant="outline"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="min-h-[44px] h-8 px-3 py-1 text-xs font-mono font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <span className="text-xs">{currentModeConfig.icon}</span>
            <span className="font-bold">{currentModeConfig.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-primary/70 transition-transform duration-200" />
          </Button>

          {/* Floating Popover Menu (Matching Attached Screenshot) */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1">
                {BOARD_MODES.map((mode) => {
                  const isSelected = activeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setActiveMode(mode.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-muted/70 shadow-xs border border-border/60'
                          : 'hover:bg-muted/40 border border-transparent'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border ${mode.badgeClass}`}
                      >
                        {mode.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs sm:text-sm text-foreground">
                            {mode.label}
                          </span>
                          {isSelected && <span className="text-primary font-bold text-xs">✓</span>}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                          {mode.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-3">
        {activeMode === 'CHEF' && (
          /* ============================================================== */
          /* 1. CHEF MODE PANEL                                             */
          /* ============================================================== */
          <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container border border-border space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground font-mono">
                Tonight's Dish
              </span>
              <span className="text-xs font-mono font-bold text-primary">
                Ready @ {servingTime}
              </span>
            </div>

            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="e.g. Thai Curry with Jasmine Rice..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-xs"
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_DISH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="min-h-[30px] text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground font-mono block">
                  Serving Time
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {SERVING_TIMES.map((time) => {
                    const isSelected = servingTime.startsWith(time);
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setServingTime(`${time} PM`)}
                        className={`min-h-[38px] py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground font-mono">
                    Extra Plates
                  </span>
                  <span className="text-xs font-mono font-semibold text-primary">
                    {extraPlates} Open
                  </span>
                </div>
                <div className="flex items-center justify-between bg-card border border-border rounded-xl px-2 py-1 min-h-[38px]">
                  <button
                    type="button"
                    disabled={extraPlates <= 0}
                    onClick={() => setExtraPlates((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Decrease extra plates"
                  >
                    <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <span className="font-mono font-bold text-xs sm:text-sm text-foreground">
                    {extraPlates} extra
                  </span>
                  <button
                    type="button"
                    onClick={() => setExtraPlates((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground hover:bg-muted transition-colors cursor-pointer"
                    aria-label="Increase extra plates"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleBroadcastChef}
              disabled={broadcastMutation.isPending || !dishName.trim()}
              className="w-full min-h-[44px] py-2.5 h-auto rounded-xl font-bold text-xs sm:text-sm tracking-wide uppercase transition-all active:scale-[0.99] cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 border-b-2 border-primary-fixed-dim flex items-center justify-center gap-2"
            >
              {broadcastMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Broadcasting Dish...</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Save & Broadcast Chef Dish</span>
                </>
              )}
            </Button>

            {/* Active Meal RSVP Section */}
            {activeMeal && activeMeal.status === 'ACTIVE' && (
              <div className="pt-3 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7 rounded-lg bg-primary text-primary-foreground">
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground font-mono font-bold text-xs">
                        {(activeMeal.chefName || 'C').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-none">
                        Chef: {activeMeal.chefName} {isChef && '(You)'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {activeMeal.extraPlates} portions available
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleToggleRsvp}
                    disabled={rsvpMutation.isPending}
                    className={`min-h-[38px] px-3 py-1.5 h-auto rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-xs ${
                      isAttending
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {isAttending ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Attending! 🍲</span>
                      </span>
                    ) : (
                      <span>RSVP</span>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    Attending ({attendingRsvps.length}):
                  </span>
                  {attendingRsvps.map((rsvp: any) => (
                    <Badge
                      key={rsvp.userId}
                      variant="outline"
                      className="text-[10px] bg-card px-2 py-0.5 border-border text-foreground font-medium"
                    >
                      {rsvp.userName} ✓
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeMode === 'NOTICE' && (
          /* ============================================================== */
          /* 2. NOTICE MODE PANEL                                           */
          /* ============================================================== */
          <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container border border-border space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground font-mono flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                House Bulletin
              </span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                Priority Notice
              </span>
            </div>

            <input
              type="text"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder="e.g. Landlord AC Inspection today at 2:00 PM..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-xs"
            />

            {/* Urgency Radio Selector */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground font-mono block">
                Notice Category
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {NOTICE_URGENCIES.map((urg) => {
                  const isSelected = noticeUrgency === urg.id;
                  return (
                    <button
                      key={urg.id}
                      type="button"
                      onClick={() => setNoticeUrgency(urg.id)}
                      className={`min-h-[38px] py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs'
                          : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>{urg.icon}</span>
                      <span>{urg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              onClick={handleBroadcastNotice}
              disabled={broadcastMutation.isPending || !noticeTitle.trim()}
              className="w-full min-h-[44px] py-2.5 h-auto rounded-xl font-bold text-xs sm:text-sm tracking-wide uppercase transition-all active:scale-[0.99] cursor-pointer shadow-xs bg-amber-600 text-white hover:bg-amber-700 border-b-2 border-amber-800 flex items-center justify-center gap-2"
            >
              {broadcastMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Broadcasting Notice...</span>
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" />
                  <span>Save & Broadcast House Notice</span>
                </>
              )}
            </Button>

            {/* Active Notice Status */}
            {activeNotice && (
              <div className="pt-3 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Active: {activeNotice.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Posted by {activeNotice.authorName} · {noticeAcks.length} acknowledged
                    </p>
                  </div>
                  {!isUserAcked && (
                    <Button
                      type="button"
                      onClick={handleAcknowledgeNotice}
                      disabled={ackNoticeMutation.isPending}
                      className="min-h-[36px] h-8 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                    >
                      {ackNoticeMutation.isPending ? 'Marking...' : 'Mark as Seen ✓'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeMode === 'QNA' && (
          /* ============================================================== */
          /* 3. Q&A MODE PANEL                                              */
          /* ============================================================== */
          <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container border border-border space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground font-mono flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                Flatmate Forum
              </span>
              <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                {qnaCategory}
              </span>
            </div>

            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Anyone have a spare HDMI cable I can borrow?..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground font-semibold text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-xs"
            />

            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_QNA_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQnaChipClick(chip)}
                  className="min-h-[30px] text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            <Button
              type="button"
              onClick={handleBroadcastQna}
              disabled={broadcastMutation.isPending || !questionText.trim()}
              className="w-full min-h-[44px] py-2.5 h-auto rounded-xl font-bold text-xs sm:text-sm tracking-wide uppercase transition-all active:scale-[0.99] cursor-pointer shadow-xs bg-sky-600 text-white hover:bg-sky-700 border-b-2 border-sky-800 flex items-center justify-center gap-2"
            >
              {broadcastMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting Question...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Save & Broadcast Question</span>
                </>
              )}
            </Button>

            {/* Active Q&A Replies Thread */}
            {activeQna && (
              <div className="pt-3 border-t border-border/60 space-y-2.5">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Active Question: {activeQna.question}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Asked by {activeQna.authorName} · {qnaReplies.length} replies
                  </p>
                </div>

                {qnaReplies.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {qnaReplies.map((rep: any) => (
                      <div
                        key={rep.replyId}
                        className="p-2 bg-card rounded-lg border border-border text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                          <span>{rep.userName}</span>
                          <span>
                            {new Date(rep.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-foreground text-xs">{rep.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input Bar */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={replyInputText}
                    onChange={(e) => setReplyInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    placeholder="Write a quick answer..."
                    className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button
                    type="button"
                    onClick={handleSendReply}
                    disabled={replyQnaMutation.isPending || !replyInputText.trim()}
                    className="min-h-[38px] px-3 h-auto rounded-xl text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default KitchenTableCard;
