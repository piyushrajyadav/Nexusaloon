'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Loader2, MessageSquare } from 'lucide-react'
import { createFeedback } from '@/app/actions/feedback'
import { useToast } from '@/components/ui/use-toast'

type FeedbackFormProps = {
    bookingId: string
    serviceName: string
    hasFeedback: boolean
}

export function FeedbackForm({ bookingId, serviceName, hasFeedback }: FeedbackFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const { toast } = useToast()

    async function handleSubmit() {
        if (rating === 0) {
            toast({
                title: 'Rating required',
                description: 'Please select a star rating.',
                variant: 'destructive'
            })
            return
        }

        setLoading(true)
        const result = await createFeedback(bookingId, rating, comment || null)
        setLoading(false)

        if (result.error) {
            toast({
                title: 'Error',
                description: result.error,
                variant: 'destructive'
            })
        } else {
            toast({
                title: 'Thank you!',
                description: 'Your feedback has been submitted.',
            })
            setOpen(false)
            setRating(0)
            setComment('')
        }
    }

    if (hasFeedback) {
        return (
            <div className="flex items-center gap-1 text-sm text-green-600">
                <MessageSquare size={14} />
                <span>Feedback submitted</span>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <Star size={14} />
                    Give Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Rate Your Experience</DialogTitle>
                    <DialogDescription>
                        How was your experience with {serviceName}?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Star Rating */}
                    <div className="space-y-2">
                        <Label>Rating *</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="p-1 transition-transform hover:scale-110"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        size={32}
                                        className={`transition-colors ${(hoverRating || rating) >= star
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </p>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment (optional)</Label>
                        <Textarea
                            id="comment"
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
