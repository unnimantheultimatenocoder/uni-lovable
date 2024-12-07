import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from '@/components/Navbar';

const TournamentManagement = () => {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    game_type: '',
    max_participants: '',
    prize_pool: '',
    start_date: '',
  });

  const { data: tournaments, refetch } = useQuery({
    queryKey: ['admin-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*, tournament_participants(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tournaments').insert([
        {
          ...formData,
          creator_id: (await supabase.auth.getUser()).data.user?.id,
          max_participants: parseInt(formData.max_participants),
          prize_pool: parseFloat(formData.prize_pool),
        },
      ]);

      if (error) throw error;

      toast.success('Tournament created successfully');
      setIsCreateDialogOpen(false);
      refetch();
      setFormData({
        title: '',
        description: '',
        game_type: '',
        max_participants: '',
        prize_pool: '',
        start_date: '',
      });
    } catch (error) {
      toast.error('Error creating tournament');
    }
  };

  const handleDeleteTournament = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Tournament deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Error deleting tournament');
    }
  };

  return (
    <div className="min-h-screen bg-gaming-dark">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Tournament Management</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gaming-accent hover:bg-gaming-accent/80">
                <Plus className="w-4 h-4 mr-2" />
                Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gaming-dark border-gaming-accent/20">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Tournament</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTournament} className="space-y-4">
                <div>
                  <Input
                    placeholder="Tournament Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-gaming-dark/50 border-gaming-accent/20 text-white"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="bg-gaming-dark/50 border-gaming-accent/20 text-white"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Game Type"
                    value={formData.game_type}
                    onChange={(e) => setFormData({ ...formData, game_type: e.target.value })}
                    required
                    className="bg-gaming-dark/50 border-gaming-accent/20 text-white"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max Participants"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    required
                    className="bg-gaming-dark/50 border-gaming-accent/20 text-white"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Prize Pool"
                    value={formData.prize_pool}
                    onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                    required
                    className="bg-gaming-dark/50 border-gaming-accent/20 text-white"
                  />
                </div>
                <div>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="bg-gaming-dark/50 border-gaming-accent/20 text-white"
                  />
                </div>
                <Button type="submit" className="w-full bg-gaming-accent hover:bg-gaming-accent/80">
                  Create Tournament
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-gaming-dark/50 border border-gaming-accent/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gaming-accent">Title</TableHead>
                <TableHead className="text-gaming-accent">Game</TableHead>
                <TableHead className="text-gaming-accent">Participants</TableHead>
                <TableHead className="text-gaming-accent">Prize Pool</TableHead>
                <TableHead className="text-gaming-accent">Status</TableHead>
                <TableHead className="text-gaming-accent">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments?.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="text-white">{tournament.title}</TableCell>
                  <TableCell className="text-gray-300">{tournament.game_type}</TableCell>
                  <TableCell className="text-gray-300">
                    {tournament.tournament_participants[0].count}/{tournament.max_participants}
                  </TableCell>
                  <TableCell className="text-gaming-accent">
                    ${tournament.prize_pool}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tournament.status === 'upcoming' 
                        ? 'bg-blue-500/20 text-blue-400'
                        : tournament.status === 'ongoing'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {tournament.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {/* Implement edit functionality */}}
                        className="text-gaming-accent hover:text-gaming-accent/80"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTournament(tournament.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TournamentManagement;