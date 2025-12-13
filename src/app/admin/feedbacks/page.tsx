import { getAllFeedbacks } from '@/app/actions/feedback'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, User, Scissors, Calendar } from 'lucide-react'
import { format } from 'date-fns'

type FeedbackType = {
    id: string
    rating: number
    comment: string | null
    createdAt: Date
    customer: { name: string }
    booking: { service: { name: string }; staff: { name: string } | null }
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={16}
                    className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
            ))}
        </div>
    )
}

export default async function FeedbacksPage() {
    const { feedbacks, error } = await getAllFeedbacks()

    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Customer Feedbacks</h1>
                <p className="text-red-500">Error loading feedbacks: {error}</p>
            </div>
        )
    }

    const averageRating = feedbacks && feedbacks.length > 0
        ? ((feedbacks as FeedbackType[]).reduce((acc: number, f: FeedbackType) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
        : '0.0'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Customer Feedbacks</h1>
                    <p className="text-muted-foreground">View and manage customer reviews</p>
                </div>
                <Card className="bg-primary text-primary-foreground">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Star className="h-8 w-8 fill-yellow-400" />
                        <div>
                            <p className="text-2xl font-bold">{averageRating}</p>
                            <p className="text-sm opacity-80">{feedbacks?.length || 0} reviews</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {!feedbacks || feedbacks.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>No feedbacks yet</p>
                        <p className="text-sm">Customer reviews will appear here</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(feedbacks as FeedbackType[]).map((feedback: FeedbackType) => (
                        <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <StarRating rating={feedback.rating} />
                                    <Badge variant="outline" className="text-xs">
                                        {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {feedback.comment && (
                                    <p className="text-sm text-gray-700 italic">&ldquo;{feedback.comment}&rdquo;</p>
                                )}
                                <div className="space-y-1.5 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <User size={14} />
                                        <span>{feedback.customer.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Scissors size={14} />
                                        <span>{feedback.booking.service.name}</span>
                                    </div>
                                    {feedback.booking.staff && (
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            <span>Served by {feedback.booking.staff.name}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
