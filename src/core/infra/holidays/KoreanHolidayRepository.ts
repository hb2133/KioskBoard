import type { KoreanHoliday } from '@/core/models/KoreanHoliday';

const CacheLifetimeMilliseconds = 24 * 60 * 60 * 1000;

interface HolidayApiRecord
{
    date?: unknown;
    localName?: unknown;
}

interface HolidayCache
{
    FetchedAt: string;
    Holidays: KoreanHoliday[];
}

function GetCacheKey(Year: number): string
{
    return `kioskboard.korean-holidays.${Year}.v1`;
}

function IsHoliday(Value: unknown): Value is KoreanHoliday
{
    if (typeof Value !== 'object' || Value == null)
    {
        return false;
    }

    const Candidate = Value as Partial<KoreanHoliday>;
    return typeof Candidate.Date === 'string' && typeof Candidate.Name === 'string';
}

function LoadCache(Year: number): HolidayCache | null
{
    try
    {
        const StoredValue = window.localStorage.getItem(GetCacheKey(Year));
        if (StoredValue == null)
        {
            return null;
        }

        const Candidate = JSON.parse(StoredValue) as Partial<HolidayCache>;
        if (
            typeof Candidate.FetchedAt !== 'string'
            || Array.isArray(Candidate.Holidays) === false
            || Candidate.Holidays.every(IsHoliday) === false
        )
        {
            return null;
        }

        return {
            FetchedAt: Candidate.FetchedAt,
            Holidays: Candidate.Holidays,
        };
    }
    catch
    {
        return null;
    }
}

function SaveCache(Year: number, Holidays: KoreanHoliday[]): void
{
    try
    {
        window.localStorage.setItem(GetCacheKey(Year), JSON.stringify({
            FetchedAt: new Date().toISOString(),
            Holidays,
        } satisfies HolidayCache));
    }
    catch
    {
        // A storage failure must not prevent the calendar from rendering fetched holidays.
    }
}

async function FetchYear(Year: number): Promise<KoreanHoliday[]>
{
    const Controller = new AbortController();
    const Timeout = window.setTimeout(() => Controller.abort(), 5_000);

    try
    {
        const Response = await fetch(
            `https://date.nager.at/api/v3/PublicHolidays/${Year}/KR`,
            { signal: Controller.signal },
        );
        if (Response.ok === false)
        {
            throw new Error(`Holiday API returned ${Response.status}.`);
        }

        const Records = await Response.json() as HolidayApiRecord[];
        if (Array.isArray(Records) === false)
        {
            throw new Error('Holiday API returned an invalid response.');
        }

        return Records.flatMap((Record) => (
            typeof Record.date === 'string' && typeof Record.localName === 'string'
                ? [{ Date: Record.date, Name: Record.localName }]
                : []
        ));
    }
    finally
    {
        window.clearTimeout(Timeout);
    }
}

async function LoadYear(Year: number): Promise<KoreanHoliday[]>
{
    const Cached = LoadCache(Year);
    const CacheAge = Cached == null
        ? Number.POSITIVE_INFINITY
        : Date.now() - new Date(Cached.FetchedAt).getTime();

    if (Cached != null && CacheAge < CacheLifetimeMilliseconds)
    {
        return Cached.Holidays;
    }

    try
    {
        const Holidays = await FetchYear(Year);
        SaveCache(Year, Holidays);
        return Holidays;
    }
    catch
    {
        return Cached?.Holidays ?? [];
    }
}

export async function LoadKoreanHolidays(Years: number[]): Promise<KoreanHoliday[]>
{
    const UniqueYears = Array.from(new Set(Years));
    const HolidaysByYear = await Promise.all(UniqueYears.map(LoadYear));
    return HolidaysByYear.flat();
}
