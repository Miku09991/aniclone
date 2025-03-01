
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { UserRound, LogOut, Settings, Heart, Clock, List } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface User {
  email: string;
  username: string;
  avatar?: string;
}

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch user data from an API
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setUsername(parsedUser.username);
      setEmail(parsedUser.email);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из аккаунта",
    });
    window.location.href = "/";
  };

  const handleSaveProfile = () => {
    if (user) {
      const updatedUser = { ...user, username, email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      toast({
        title: "Профиль обновлен",
        description: "Ваш профиль успешно обновлен",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-white">Пожалуйста, войдите в аккаунт</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-[#2a2a2a] mb-4">
                  {user.avatar ? (
                    <AspectRatio ratio={1}>
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="object-cover w-full h-full"
                      />
                    </AspectRatio>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserRound size={64} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl">{user.username}</CardTitle>
                <CardDescription className="text-gray-400">{user.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => setIsEditing(true)}
                >
                  <Settings size={16} className="mr-2" />
                  Настройки профиля
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-950/20"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-2" />
                  Выйти
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="bg-[#1a1a1a]">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="favorites">Избранное</TabsTrigger>
              <TabsTrigger value="history">История просмотров</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
                <CardHeader>
                  <CardTitle>Информация профиля</CardTitle>
                  <CardDescription>
                    Управляйте информацией своего профиля
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="edit-username" className="text-sm font-medium">Имя пользователя</label>
                        <Input
                          id="edit-username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-[#2a2a2a] border-[#3a3a3a]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-[#2a2a2a] border-[#3a3a3a]"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Имя пользователя</span>
                        <span>{user.username}</span>
                      </div>
                      <Separator className="bg-[#2a2a2a]" />
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Email</span>
                        <span>{user.email}</span>
                      </div>
                      <Separator className="bg-[#2a2a2a]" />
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  {isEditing ? (
                    <div className="flex space-x-2 w-full">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="flex-1"
                      >
                        Отмена
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        className="flex-1"
                      >
                        Сохранить
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      Редактировать профиль
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="favorites">
              <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
                <CardHeader>
                  <CardTitle>Избранное аниме</CardTitle>
                  <CardDescription>
                    Список аниме, добавленных в избранное
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Heart size={64} className="text-gray-400 mb-4" />
                    <p className="text-gray-400">У вас пока нет избранного аниме</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
                <CardHeader>
                  <CardTitle>История просмотров</CardTitle>
                  <CardDescription>
                    Недавно просмотренное аниме
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <Clock size={64} className="text-gray-400 mb-4" />
                    <p className="text-gray-400">История просмотров пуста</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
