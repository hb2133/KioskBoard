import Hangul from 'hangul-js';
import { useRef } from 'react';
import type {
    InputHTMLAttributes,
    KeyboardEvent,
    TextareaHTMLAttributes,
} from 'react';

const HangulKeyMap: Record<string, string> = {
    r: 'ㄱ', R: 'ㄲ', s: 'ㄴ', e: 'ㄷ', E: 'ㄸ', f: 'ㄹ',
    a: 'ㅁ', q: 'ㅂ', Q: 'ㅃ', t: 'ㅅ', T: 'ㅆ', d: 'ㅇ',
    w: 'ㅈ', W: 'ㅉ', c: 'ㅊ', z: 'ㅋ', x: 'ㅌ', v: 'ㅍ', g: 'ㅎ',
    k: 'ㅏ', o: 'ㅐ', i: 'ㅑ', O: 'ㅒ', j: 'ㅓ', p: 'ㅔ',
    u: 'ㅕ', P: 'ㅖ', h: 'ㅗ', y: 'ㅛ', n: 'ㅜ', b: 'ㅠ',
    m: 'ㅡ', l: 'ㅣ',
};

interface HangulComposition
{
    Start: number;
    Jamo: string[];
    RenderedLength: number;
}

interface HangulFieldBindings
{
    Value: string;
    IsHangulMode: boolean;
    OnValueChange: (Value: string) => void;
    OnToggleMode: () => void;
}

export interface HangulTextInputProps extends HangulFieldBindings,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>
{
}

export interface HangulTextAreaProps extends HangulFieldBindings,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>
{
}

function IsHangulToggleKey(Event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): boolean
{
    return Event.code === 'Lang1'
        || Event.key === 'HangulMode'
        || Event.code === 'AltRight';
}

function UseHangulComposition(Bindings: HangulFieldBindings)
{
    const Composition = useRef<HangulComposition | null>(null);

    function ResetComposition(): void
    {
        Composition.current = null;
    }

    function HandleKeyDown(Event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>): void
    {
        if (IsHangulToggleKey(Event) === true)
        {
            Event.preventDefault();
            ResetComposition();
            Bindings.OnToggleMode();
            return;
        }

        if (Bindings.IsHangulMode === false)
        {
            return;
        }

        if (Event.ctrlKey === true || Event.metaKey === true || Event.altKey === true)
        {
            return;
        }

        const Target = Event.currentTarget;
        const SelectionStart = Target.selectionStart ?? Bindings.Value.length;
        const SelectionEnd = Target.selectionEnd ?? SelectionStart;
        const MappedJamo = HangulKeyMap[Event.key];

        if (MappedJamo != null)
        {
            Event.preventDefault();

            const CurrentComposition = Composition.current;
            const CanContinue = CurrentComposition != null
                && SelectionStart === SelectionEnd
                && SelectionStart === CurrentComposition.Start + CurrentComposition.RenderedLength;
            const Start = CanContinue ? CurrentComposition.Start : SelectionStart;
            const PreviousRenderedLength = CanContinue ? CurrentComposition.RenderedLength : SelectionEnd - SelectionStart;
            const Jamo = CanContinue
                ? [...CurrentComposition.Jamo, MappedJamo]
                : [MappedJamo];
            const AssembledText = Hangul.assemble(Jamo);
            const NextValue = Bindings.Value.slice(0, Start)
                + AssembledText
                + Bindings.Value.slice(Start + PreviousRenderedLength);
            const NextCaret = Start + AssembledText.length;

            Composition.current = {
                Start,
                Jamo,
                RenderedLength: AssembledText.length,
            };
            Bindings.OnValueChange(NextValue);
            window.requestAnimationFrame(() => Target.setSelectionRange(NextCaret, NextCaret));
            return;
        }

        if (Event.key === 'Backspace' && Composition.current != null)
        {
            const CurrentComposition = Composition.current;

            if (SelectionStart === CurrentComposition.Start + CurrentComposition.RenderedLength)
            {
                Event.preventDefault();
                const NextJamo = CurrentComposition.Jamo.slice(0, -1);
                const AssembledText = Hangul.assemble(NextJamo);
                const NextValue = Bindings.Value.slice(0, CurrentComposition.Start)
                    + AssembledText
                    + Bindings.Value.slice(CurrentComposition.Start + CurrentComposition.RenderedLength);
                const NextCaret = CurrentComposition.Start + AssembledText.length;

                Composition.current = NextJamo.length === 0
                    ? null
                    : {
                        Start: CurrentComposition.Start,
                        Jamo: NextJamo,
                        RenderedLength: AssembledText.length,
                    };
                Bindings.OnValueChange(NextValue);
                window.requestAnimationFrame(() => Target.setSelectionRange(NextCaret, NextCaret));
                return;
            }
        }

        if (Event.key.length === 1 || Event.key.startsWith('Arrow') || Event.key === 'Enter')
        {
            ResetComposition();
        }
    }

    return {
        HandleKeyDown,
        ResetComposition,
    };
}

export function HangulTextInput(Properties: HangulTextInputProps)
{
    const {
        Value,
        IsHangulMode,
        OnValueChange,
        OnToggleMode,
        ...InputProperties
    } = Properties;
    const Composition = UseHangulComposition({
        Value,
        IsHangulMode,
        OnValueChange,
        OnToggleMode,
    });

    return (
        <input
            {...InputProperties}
            onBlur={Composition.ResetComposition}
            onChange={(Event) =>
            {
                Composition.ResetComposition();
                OnValueChange(Event.target.value);
            }}
            onKeyDown={Composition.HandleKeyDown}
            value={Value}
        />
    );
}

export function HangulTextArea(Properties: HangulTextAreaProps)
{
    const {
        Value,
        IsHangulMode,
        OnValueChange,
        OnToggleMode,
        ...TextAreaProperties
    } = Properties;
    const Composition = UseHangulComposition({
        Value,
        IsHangulMode,
        OnValueChange,
        OnToggleMode,
    });

    return (
        <textarea
            {...TextAreaProperties}
            onBlur={Composition.ResetComposition}
            onChange={(Event) =>
            {
                Composition.ResetComposition();
                OnValueChange(Event.target.value);
            }}
            onKeyDown={Composition.HandleKeyDown}
            value={Value}
        />
    );
}
