'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteService } from './actions'
import { useToast } from '@/components/ui/use-toast'

export function DeleteServiceButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    setLoading(true)
    const result = await deleteService(id)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      })
    } else {
      toast({
        title: "Success",
        description: "Service deleted successfully",
      })
    }
    setLoading(false)
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading} className="text-red-500 hover:text-red-700 hover:bg-red-50">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}
