from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password','is_superuser','is_active']


    def create(self, validated_data):
        # Cifrar la contraseña antes de crear el usuario
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])  # Cifra la contraseña
        user.save()
        return user

    def update(self, instance, validated_data):
        # Si el usuario actualiza la contraseña, se cifra
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance