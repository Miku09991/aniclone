import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { UserRound, LogOut, Settings, Heart, Clock, List, Upload, Mail, Lock, KeyRound } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, uploadAvatar, updateUserEmail, updateUserPassword, resetPassword } from "@/lib/supabase";
import { getFavoriteAnimes } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Anime } from "@/types/anime";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
export function UserProfile() {
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const {
    toast
  } = useToast();

  // State for email and password change
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResetingPassword, setIsResetingPassword] = useState(false);

  // Получаем список избранных аниме
  const {
    data: favoriteAnimes = [],
    isLoading: isLoadingFavorites
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoriteAnimes,
    enabled: !!user
  });
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }
    try {
      setUploading(true);
      const file = event.target.files[0];
      const result = await uploadAvatar(user.id, file);
      if (result.success) {
        setAvatarUrl(result.avatarUrl);
        toast({
          title: "Аватар обновлен",
          description: "Ваш аватар успешно загружен"
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.error || "Не удалось загрузить аватар",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аватар",
        variant: "destructive"
      });
      console.error("Ошибка загрузки аватара:", error);
    } finally {
      setUploading(false);
    }
  };
  const handleSaveProfile = async () => {
    if (user) {
      const updates = {
        username,
        updated_at: new Date().toISOString()
      };
      const success = await updateProfile(user.id, updates);
      if (success) {
        setIsEditing(false);
        toast({
          title: "Профиль обновлен",
          description: "Ваш профиль успешно обновлен"
        });
        // Перезагрузка страницы для обновления данных профиля
        window.location.reload();
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить профиль",
          variant: "destructive"
        });
      }
    }
  };
  const handleEmailChange = async () => {
    if (!user?.email) return;
    const result = await updateUserEmail(newEmail);
    if (result.success) {
      toast({
        title: "Запрос отправлен",
        description: result.message
      });
      setIsChangingEmail(false);
      setNewEmail("");
    } else {
      toast({
        title: "Ошибка",
        description: result.error || "Не удалось обновить email",
        variant: "destructive"
      });
    }
  };
  const handlePasswordChange = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive"
      });
      return;
    }
    const result = await updateUserPassword(password);
    if (result.success) {
      toast({
        title: "Пароль обновлен",
        description: result.message
      });
      setIsChangingPassword(false);
      setPassword("");
      setConfirmPassword("");
    } else {
      toast({
        title: "Ошибка",
        description: result.error || "Не удалось обновить пароль",
        variant: "destructive"
      });
    }
  };
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const result = await resetPassword(user.email);
    if (result.success) {
      toast({
        title: "Запрос отправлен",
        description: result.message
      });
      setIsResetingPassword(false);
    } else {
      toast({
        title: "Ошибка",
        description: result.error || "Не удалось отправить запрос на сброс пароля",
        variant: "destructive"
      });
    }
  };
  if (!user || !profile) {
    return <div className="flex justify-center items-center h-[70vh]">
        <p className="text-white">Пожалуйста, войдите в аккаунт</p>
      </div>;
  }
  return <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[#2a2a2a] mb-4">
                  {avatarUrl ? <AspectRatio ratio={1}>
                      <img src={avatarUrl} alt={profile.username} className="object-cover w-full h-full" />
                    </AspectRatio> : <div className="w-full h-full flex items-center justify-center">
                      <UserRound size={64} className="text-gray-400" />
                    </div>}
                  
                  {isEditing && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <label htmlFor="avatar-upload" className="cursor-pointer bg-[#2a2a2a] hover:bg-[#3a3a3a] p-2 rounded-full">
                        <Upload size={24} className="text-white" />
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                      </label>
                    </div>}
                </div>
                <CardTitle className="text-xl text-violet-700">{profile.username}</CardTitle>
                <CardDescription className="text-gray-400">{user.email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsEditing(true)}>
                  <Settings size={16} className="mr-2" />
                  Настройки профиля
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-950/20" onClick={signOut}>
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
              <TabsTrigger value="security">Безопасность</TabsTrigger>
              <TabsTrigger value="favorites">Избранное</TabsTrigger>
              <TabsTrigger value="history">История просмотров</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
                <CardHeader>
                  <CardTitle className="text-slate-50">Информация профиля</CardTitle>
                  <CardDescription>
                    Управляйте информацией своего профиля
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? <>
                      <div className="space-y-2">
                        <label htmlFor="edit-username" className="text-sm font-medium">Имя пользователя</label>
                        <Input id="edit-username" value={username} onChange={e => setUsername(e.target.value)} className="bg-[#2a2a2a] border-[#3a3a3a]" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit-email" className="text-sm font-medium">Email</label>
                        <Input id="edit-email" type="email" value={user.email || ""} disabled className="bg-[#2a2a2a] border-[#3a3a3a] opacity-60" />
                        <p className="text-xs text-gray-400">Для смены адреса электронной почты перейдите в раздел "Безопасность"</p>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="avatar-upload-profile" className="text-sm font-medium">Аватар</label>
                        <div className="flex items-center space-x-2">
                          <Input id="avatar-upload-profile" type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="bg-[#2a2a2a] border-[#3a3a3a]" />
                          {uploading && <div className="w-5 h-5 border-t-2 border-red-500 border-solid rounded-full animate-spin"></div>}
                        </div>
                      </div>
                    </> : <>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Имя пользователя</span>
                        <span className="text-slate-50">{profile.username}</span>
                      </div>
                      <Separator className="bg-[#2a2a2a]" />
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Email</span>
                        <span className="text-slate-50">{user.email}</span>
                      </div>
                      <Separator className="bg-[#2a2a2a]" />
                    </>}
                </CardContent>
                <CardFooter>
                  {isEditing ? <div className="flex space-x-2 w-full">
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                        Отмена
                      </Button>
                      <Button onClick={handleSaveProfile} className="flex-1">
                        Сохранить
                      </Button>
                    </div> : <Button variant="outline" onClick={() => setIsEditing(true)} className="w-full">
                      Редактировать профиль
                    </Button>}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
                <CardHeader>
                  <CardTitle className="text-slate-50">Безопасность аккаунта</CardTitle>
                  <CardDescription>
                    Управление электронной почтой и паролем
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-slate-50">Электронная почта</h3>
                    <p className="text-sm text-gray-400 mb-4">Текущий email: {user.email}</p>
                    
                    <Dialog open={isChangingEmail} onOpenChange={setIsChangingEmail}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Изменить Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                        <DialogHeader>
                          <DialogTitle>Изменение электронной почты</DialogTitle>
                          <DialogDescription>
                            На новый адрес будет отправлено письмо с подтверждением
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="new-email" className="text-sm font-medium">Новый Email</label>
                            <Input id="new-email" type="email" placeholder="new-email@example.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-[#2a2a2a] border-[#3a3a3a]" />
                          </div>
                          
                          <Alert className="bg-[#2a2a2a] border-amber-600">
                            <AlertDescription>
                              После изменения адреса электронной почты вам придется повторно войти в систему
                            </AlertDescription>
                          </Alert>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsChangingEmail(false)}>Отмена</Button>
                          <Button onClick={handleEmailChange}>Изменить Email</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <Separator className="bg-[#2a2a2a]" />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-slate-50">Пароль</h3>
                    
                    <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            Изменить пароль
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                          <DialogHeader>
                            <DialogTitle>Изменение пароля</DialogTitle>
                            <DialogDescription>
                              Введите новый пароль для вашего аккаунта
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label htmlFor="new-password" className="text-sm font-medium">Новый пароль</label>
                              <Input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-[#2a2a2a] border-[#3a3a3a]" />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="confirm-password" className="text-sm font-medium">Подтвердите пароль</label>
                              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-[#2a2a2a] border-[#3a3a3a]" />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsChangingPassword(false)}>Отмена</Button>
                            <Button onClick={handlePasswordChange}>Сохранить пароль</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={isResetingPassword} onOpenChange={setIsResetingPassword}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex items-center">
                            <KeyRound className="w-4 h-4 mr-2" />
                            Сбросить пароль
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                          <DialogHeader>
                            <DialogTitle>Сброс пароля</DialogTitle>
                            <DialogDescription>
                              Инструкции по сбросу пароля будут отправлены на ваш email
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="py-4">
                            <Alert className="bg-[#2a2a2a] border-amber-600">
                              <AlertDescription>
                                Письмо со ссылкой для сброса пароля будет отправлено на адрес {user.email}
                              </AlertDescription>
                            </Alert>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResetingPassword(false)}>Отмена</Button>
                            <Button onClick={handlePasswordReset}>Отправить инструкции</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="favorites">
              <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
                <CardHeader>
                  <CardTitle className="text-slate-50">Избранное аниме</CardTitle>
                  <CardDescription>
                    Список аниме, добавленных в избранное
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFavorites ? <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-t-2 border-red-500 border-solid rounded-full animate-spin"></div>
                    </div> : favoriteAnimes.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favoriteAnimes.map((anime: Anime) => <Link to={`/anime/${anime.id}`} key={anime.id} className="block">
                          <div className="bg-[#2a2a2a] rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all">
                            <AspectRatio ratio={2 / 3}>
                              <img src={anime.image} alt={anime.title} className="w-full h-full object-cover" />
                            </AspectRatio>
                            <div className="p-3 bg-neutral-800">
                              <h3 className="text-sm font-medium line-clamp-2 text-slate-50">{anime.title}</h3>
                            </div>
                          </div>
                        </Link>)}
                    </div> : <div className="flex flex-col items-center justify-center py-12">
                      <Heart size={64} className="text-gray-400 mb-4" />
                      <p className="text-gray-400">У вас пока нет избранного аниме</p>
                    </div>}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
                <CardHeader>
                  <CardTitle className="text-slate-50">История просмотров</CardTitle>
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
    </div>;
}